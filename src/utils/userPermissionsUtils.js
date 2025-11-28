export async function userPermissions() {
  try {
    const response = await fetch('/api/userpermissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.Mensaje || 'Failed to validate user Permissions');
    }

    const data = await response.json();
    console.log('Fetched permissions:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user Permissions:', error);
    throw new Error('Unable to validate user Permissions');
  }
}
