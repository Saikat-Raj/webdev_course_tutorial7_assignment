from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restx import Api, Resource, fields, Namespace
from pymongo import MongoClient
import bcrypt
import jwt
from datetime import datetime, timedelta
from bson.objectid import ObjectId
import os
import logging
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

app = Flask(__name__)

# Production configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
app.config['ENV'] = os.getenv('FLASK_ENV', 'production')

# Security headers
@app.after_request
def after_request(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# CORS configuration for production
if app.config['ENV'] == 'production':
    CORS(app, origins=['https://your-frontend-domain.com'])
else:
    CORS(app)

# Logging configuration
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

api = Api(app, 
    version='1.0',
    title='ProdManage API',
    description='A comprehensive product management system with user authentication and role-based access control',
    doc='/docs/'
)

# Database connection with proper error handling
try:
    client = MongoClient(
        os.getenv('MONGODB_URI'),
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=10000,
        socketTimeoutMS=10000,
        maxPoolSize=50,
        minPoolSize=5
    )
    # Test connection
    client.admin.command('ping')
    logger.info("Connected to MongoDB successfully")
    db = client[os.getenv('DATABASE_NAME', 'prodmanager')]
    users_collection = db['users']
    products_collection = db['products']
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")
    raise

# Namespaces
auth_ns = Namespace('auth', description='Authentication operations')
products_ns = Namespace('products', description='Product management operations')

api.add_namespace(auth_ns, path='/api/auth')
api.add_namespace(products_ns, path='/')

# Health check endpoint
@app.route('/health')
def health_check():
    try:
        # Test database connection
        client.admin.command('ping')
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0',
            'database': 'connected'
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.utcnow().isoformat(),
            'error': 'Database connection failed'
        }), 503

# Models
user_model = api.model('User', {
    'id': fields.String(required=True, description='User ID'),
    'name': fields.String(required=True, description='User full name'),
    'email': fields.String(required=True, description='User email address'),
    'role': fields.String(required=True, description='User role (admin/customer)')
})

user_register_model = api.model('UserRegister', {
    'name': fields.String(required=True, description='User full name'),
    'email': fields.String(required=True, description='User email address'),
    'password': fields.String(required=True, description='User password'),
    'role': fields.String(description='User role (defaults to customer)')
})

user_login_model = api.model('UserLogin', {
    'email': fields.String(required=True, description='User email address'),
    'password': fields.String(required=True, description='User password')
})

auth_response_model = api.model('AuthResponse', {
    'token': fields.String(required=True, description='JWT authentication token'),
    'user': fields.Nested(user_model, description='User information')
})

product_model = api.model('Product', {
    '_id': fields.String(description='Product ID'),
    'name': fields.String(required=True, description='Product name'),
    'description': fields.String(required=True, description='Product description'),
    'price': fields.Float(required=True, description='Product price'),
    'user_id': fields.String(description='Owner user ID'),
    'created_at': fields.DateTime(description='Creation timestamp'),
    'updated_at': fields.DateTime(description='Last update timestamp')
})

product_input_model = api.model('ProductInput', {
    'name': fields.String(required=True, description='Product name'),
    'description': fields.String(required=True, description='Product description'),
    'price': fields.Float(required=True, description='Product price')
})

error_model = api.model('Error', {
    'error': fields.String(required=True, description='Error message')
})

def verify_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            logger.warning("Request made without authentication token")
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
            current_user_role = data['role']
            logger.info(f"Authenticated user: {current_user_id}")
        except jwt.ExpiredSignatureError:
            logger.warning("Request made with expired token")
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            logger.warning("Request made with invalid token")
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(current_user_id, current_user_role, *args, **kwargs)
    
    return decorated_function

def validate_email(email):
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    return len(password) >= 8

# Global error handlers
@app.errorhandler(400)
def bad_request(error):
    logger.error(f"Bad request: {error}")
    return jsonify({'error': 'Bad request'}), 400

@app.errorhandler(404)
def not_found(error):
    logger.error(f"Not found: {error}")
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

# Authorization header for Swagger
authorizations = {
    'Bearer': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization',
        'description': 'JWT Authorization header using the Bearer scheme. Example: "Bearer {token}"'
    }
}

api.authorizations = authorizations

# Authentication Endpoints
@auth_ns.route('/register')
class Register(Resource):
    @api.expect(user_register_model)
    @api.marshal_with(auth_response_model, code=201)
    @api.response(400, 'Missing required fields', error_model)
    @api.response(400, 'Email already registered', error_model)
    def post(self):
        """Register a new user"""
        try:
            data = request.get_json()
            
            if not data or not all(key in data for key in ["name", "email", "password"]):
                logger.warning("Registration attempt with missing fields")
                return {"error": "Missing required fields"}, 400
            
            # Input validation
            if not validate_email(data["email"]):
                return {"error": "Invalid email format"}, 400
            
            if not validate_password(data["password"]):
                return {"error": "Password must be at least 8 characters long"}, 400
            
            if len(data["name"].strip()) < 2:
                return {"error": "Name must be at least 2 characters long"}, 400
            
            if users_collection.find_one({"email": data["email"]}):
                logger.warning(f"Registration attempt with existing email: {data['email']}")
                return {"error": "Email already registered"}, 400
            
            hashed_password = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt())
            
            role = data.get("role", "customer")
            if role not in ["customer", "admin"]:
                role = "customer"
            
            user_doc = {
                "name": data["name"].strip(),
                "email": data["email"].lower(),
                "password": hashed_password.decode('utf-8'),
                "role": role,
                "created_at": datetime.utcnow()
            }
            
            result = users_collection.insert_one(user_doc)
            user_id = str(result.inserted_id)
            
            token = jwt.encode({
                'user_id': user_id,
                'role': role,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm='HS256')
            
            logger.info(f"New user registered: {user_id}")
            
            return {
                "token": token, 
                "user": {
                    "id": user_id, 
                    "name": data["name"].strip(), 
                    "email": data["email"].lower(), 
                    "role": role
                }
            }, 201
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return {"error": "Registration failed"}, 500


@auth_ns.route('/login')
class Login(Resource):
    @api.expect(user_login_model)
    @api.marshal_with(auth_response_model, code=200)
    @api.response(400, 'Missing email and password', error_model)
    @api.response(401, 'Invalid credentials', error_model)
    def post(self):
        """Authenticate user and return JWT token"""
        try:
            data = request.get_json()
            
            if not data or not all(key in data for key in ["email", "password"]):
                logger.warning("Login attempt with missing credentials")
                return {"error": "Missing email and password"}, 400
            
            if not validate_email(data["email"]):
                return {"error": "Invalid email format"}, 400
            
            user = users_collection.find_one({"email": data["email"].lower()})
            
            if not user:
                logger.warning(f"Login attempt with non-existent email: {data['email']}")
                return {"error": "Invalid credentials"}, 401
            
            if not bcrypt.checkpw(data["password"].encode('utf-8'), user["password"].encode('utf-8')):
                logger.warning(f"Login attempt with wrong password for: {data['email']}")
                return {"error": "Invalid credentials"}, 401
            
            token = jwt.encode({
                'user_id': str(user["_id"]),
                'role': user["role"],
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm='HS256')
            
            logger.info(f"User logged in: {str(user['_id'])}")
            
            return {
                "token": token, 
                "user": {
                    "id": str(user["_id"]), 
                    "name": user["name"], 
                    "email": user["email"], 
                    "role": user["role"]
                }
            }, 200
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return {"error": "Login failed"}, 500


# Product Endpoints
@products_ns.route('/listproducts')
class ProductList(Resource):
    @api.doc(security='Bearer')
    @api.marshal_list_with(product_model, code=200)
    @api.response(401, 'Token is missing or invalid', error_model)
    @api.response(500, 'Internal server error', error_model)
    def get(self):
        """Get all products for the authenticated user"""
        token = request.headers.get('Authorization')
        if not token:
            return {'error': 'Token is missing'}, 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return {'error': 'Token has expired'}, 401
        except jwt.InvalidTokenError:
            return {'error': 'Token is invalid'}, 401
        
        try:
            user_products = list(products_collection.find({"user_id": current_user_id}))
            for product in user_products:
                product["_id"] = str(product["_id"])
            return user_products
        except Exception as e:
            return {"error": str(e)}, 500


@products_ns.route('/addproduct')
class ProductCreate(Resource):
    @api.doc(security='Bearer')
    @api.expect(product_input_model)
    @api.marshal_with(product_model, code=201)
    @api.response(400, 'Missing required fields', error_model)
    @api.response(401, 'Token is missing or invalid', error_model)
    @api.response(500, 'Internal server error', error_model)
    def post(self):
        """Create a new product"""
        token = request.headers.get('Authorization')
        if not token:
            return {'error': 'Token is missing'}, 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            data_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data_token['user_id']
        except jwt.ExpiredSignatureError:
            return {'error': 'Token has expired'}, 401
        except jwt.InvalidTokenError:
            return {'error': 'Token is invalid'}, 401
        
        data = request.get_json()

        if not data or not all(key in data for key in ["name", "description", "price"]):
            return {"error": "Missing required fields"}, 400

        try:
            product_doc = {
                "name": data["name"],
                "description": data["description"],
                "price": data["price"],
                "user_id": current_user_id,
                "created_at": datetime.utcnow()
            }

            result = products_collection.insert_one(product_doc)
            product_doc["_id"] = str(result.inserted_id)
            
            return product_doc, 201
        except Exception as e:
            return {"error": str(e)}, 500


@products_ns.route('/editproduct/<string:product_id>')
class ProductEdit(Resource):
    @api.doc(security='Bearer')
    @api.expect(product_input_model)
    @api.marshal_with(product_model, code=200)
    @api.response(400, 'Missing required fields', error_model)
    @api.response(401, 'Token is missing or invalid', error_model)
    @api.response(404, 'Product not found', error_model)
    @api.response(500, 'Internal server error', error_model)
    def put(self, product_id):
        """Update an existing product"""
        token = request.headers.get('Authorization')
        if not token:
            return {'error': 'Token is missing'}, 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            data_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data_token['user_id']
        except jwt.ExpiredSignatureError:
            return {'error': 'Token has expired'}, 401
        except jwt.InvalidTokenError:
            return {'error': 'Token is invalid'}, 401

        data = request.get_json()

        if not data or not all(key in data for key in ["name", "description", "price"]):
            return {"error": "Missing required fields"}, 400

        try:
            product = products_collection.find_one({
                "_id": ObjectId(product_id),
                "user_id": current_user_id
            })
            
            if not product:
                return {"error": "Product not found"}, 404

            update_data = {
                "name": data["name"],
                "description": data["description"],
                "price": data["price"],
                "updated_at": datetime.utcnow()
            }

            products_collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": update_data}
            )

            updated_product = products_collection.find_one({"_id": ObjectId(product_id)})
            updated_product["_id"] = str(updated_product["_id"])
            
            return updated_product
        except Exception as e:
            return {"error": str(e)}, 500


@products_ns.route('/deleteproduct/<string:product_id>')
class ProductDelete(Resource):
    @api.doc(security='Bearer')
    @api.marshal_with(product_model, code=200)
    @api.response(401, 'Token is missing or invalid', error_model)
    @api.response(404, 'Product not found', error_model)
    @api.response(500, 'Internal server error', error_model)
    def delete(self, product_id):
        """Delete a product"""
        token = request.headers.get('Authorization')
        if not token:
            return {'error': 'Token is missing'}, 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            data_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data_token['user_id']
        except jwt.ExpiredSignatureError:
            return {'error': 'Token has expired'}, 401
        except jwt.InvalidTokenError:
            return {'error': 'Token is invalid'}, 401

        try:
            product = products_collection.find_one({
                "_id": ObjectId(product_id),
                "user_id": current_user_id
            })
            
            if not product:
                return {"error": "Product not found"}, 404

            products_collection.delete_one({"_id": ObjectId(product_id)})
            product["_id"] = str(product["_id"])
            
            return product
        except Exception as e:
            return {"error": str(e)}, 500


@products_ns.route('/getproduct/<string:product_id>')
class ProductGet(Resource):
    @api.doc(security='Bearer')
    @api.marshal_with(product_model, code=200)
    @api.response(401, 'Token is missing or invalid', error_model)
    @api.response(404, 'Product not found', error_model)
    @api.response(500, 'Internal server error', error_model)
    def get(self, product_id):
        """Get a specific product by ID"""
        token = request.headers.get('Authorization')
        if not token:
            return {'error': 'Token is missing'}, 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            data_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data_token['user_id']
        except jwt.ExpiredSignatureError:
            return {'error': 'Token has expired'}, 401
        except jwt.InvalidTokenError:
            return {'error': 'Token is invalid'}, 401

        try:
            product = products_collection.find_one({
                "_id": ObjectId(product_id),
                "user_id": current_user_id
            })
            
            if not product:
                return {"error": "Product not found"}, 404

            product["_id"] = str(product["_id"])
            return product
        except Exception as e:
            return {"error": str(e)}, 500


if __name__ == "__main__":
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug, port=port, host='0.0.0.0')
