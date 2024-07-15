$(document).ready(()=> {
    const viewUsers = async (page) => {
        try {
            const response = await fetch(`/users?page=${page}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error loading page:', error);
        }
    };
    
    viewUsers()
})