export async function login(formData) {
    const { email, password } = formData;

    try {
        const response = await fetch("/api/jinx/Login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email,password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.Mensaje || 'Failed to login');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error login:', error);
        throw new Error('Tu correo electrónico o contraseña es incorrecto.');
    }
}

export async function userAccess(formData) {
    const { empresa } = formData;

    try {
        const response = await fetch("/api/jinx/UserAccess", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ empresa })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.Mensaje || 'Failed to validate user access');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error user access:', error);
        throw new Error('Tu correo electrónico o contraseña es incorrecto.');
    }
}

export async function sendEmail(formData) {
    const { email } = formData;

    try {
        const response = await fetch("/api/jinx/SolicitarRecuperoClave", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.Mensaje || 'Failed to validate user access');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error user access:', error);
        throw new Error('Unable to validate user access');
    }
}

export async function resetPassword(formData) {
    const { email,codigo,password } = formData;

    try {
        const response = await fetch("/api/jinx/SolicitarRecuperoClave", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.Mensaje || 'Failed to validate user access');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error user access:', error);
        throw new Error('Unable to validate user access');
    }
}

