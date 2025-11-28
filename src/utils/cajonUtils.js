export async function SearchArt(formData) {
    const { Fullcode, Codebar } = formData;
    console.log(Fullcode)

    // Construir el cuerpo de la solicitud dinámicamente
    const requestBody = {};
    if (Fullcode) {
        requestBody.Fullcode = Fullcode;
    }
    if (Codebar) {
        requestBody.Codebar = Codebar;
    }

    try {
        const response = await fetch("/api/syndra/catalogo/articulo", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.Mensaje || 'Failed to validate Art');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error Art:', error);
        throw new Error('Unable to validate Art');
    }
}

export async function CreateCajon(formData) {
    const { IdArticulo, Cantidad } = formData;

    try {
        const response = await fetch("/api/syndra/avicola/cajon/create", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ IdArticulo, Cantidad })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.Mensaje || 'Failed to create cajon');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error cajon:', error);
        throw new Error('Unable to create cajon');
    }
}