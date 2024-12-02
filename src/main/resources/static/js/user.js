const currentUserUrl = '/api/user';
const currentUserEmail = document.getElementById('currentUserEmail');
const currentUserRoles = document.getElementById('currentUserRoles');
const userInfoTableBody = document.querySelector('#userInfoTable tbody');

async function getCurrentUser() {
    try {
        const response = await fetch(currentUserUrl);
        const user = await response.json();
        currentUserEmail.textContent = user.email;
        user.roles.forEach(role => {
            const roleName = role.name.replace('ROLE_', '');
            const span = document.createElement('span');
            span.classList.add('badge', 'bg-secondary', 'me-1');
            span.textContent = roleName;
            currentUserRoles.appendChild(span);
        });

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.surname}</td>
            <td>${user.age}</td>
            <td>${user.email}</td>
            <td>${user.roles.map(role => role.name.replace('ROLE_', '')).join(', ')}</td>
        `;
        userInfoTableBody.appendChild(tr);
    } catch (error) {
        console.error('Error fetching current user:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getCurrentUser();
});
