export const styles = {
    body: {
        margin: 0,
        fontFamily: "'Inter', sans-serif",
        backgroundColor: '#f4f7f6',
        color: '#333'
    },
    appContainer: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
    },
    navbar: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#2c3e50',
        padding: '15px 20px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        margin: '10px'
    },
    navButton: {
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        margin: '0 8px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s ease',
        flexGrow: 1,
        maxWidth: '150px'
    },
    navButtonHover: {
        backgroundColor: '#2980b9'
    },
    mainContent: {
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '20px'
    },
    pageContent: {
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
        textAlign: 'center',
        maxWidth: '800px',
        width: '100%'
    },
    pageContentH2: {
        color: '#2c3e50',
        marginBottom: '15px'
    },
    formContainer: {
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
        maxWidth: '600px',
        width: '100%'
    },
    formGroup: {
        marginBottom: '20px',
        textAlign: 'left'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#2c3e50'
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '16px',
        boxSizing: 'border-box'
    },
    button: {
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        margin: '0 5px',
        transition: 'background-color 0.3s ease'
    },
    buttonSecondary: {
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        margin: '0 5px',
        transition: 'background-color 0.3s ease'
    },
    buttonDanger: {
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        margin: '0 5px',
        transition: 'background-color 0.3s ease'
    },
    buttonSuccess: {
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        margin: '0 5px',
        transition: 'background-color 0.3s ease'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)'
    },
    th: {
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '12px',
        textAlign: 'left',
        fontWeight: 'bold'
    },
    td: {
        padding: '12px',
        borderBottom: '1px solid #eee'
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '20px'
    }
};