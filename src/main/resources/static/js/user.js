const currentUserUrlUserPage = '/api/user';
const userInfoTableBody = document.querySelector('#userInfoTable tbody');
const currentUserEmailUserPage = document.getElementById('currentUserEmail');
const currentUserRolesUserPage = document.getElementById('currentUserRoles');

async function loadCurrentUserInfo() {
    try {
        const response = await fetch(currentUserUrlUserPage);
        const user = await response.json();
        currentUserEmailUserPage.textContent = user.email;
        currentUserRolesUserPage.innerHTML = '';
        user.roles.forEach(role => {
            const roleName = role.name.replace('ROLE_', '');
            const span = document.createElement('span');
            span.classList.add('badge', 'bg-secondary', 'me-1');
            span.textContent = roleName;
            currentUserRolesUserPage.appendChild(span);
        });

        userInfoTableBody.innerHTML = `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.surname}</td>
                <td>${user.age}</td>
                <td>${user.email}</td>
                <td>${user.roles.map(r => r.name.replace('ROLE_', '')).join(', ')}</td>
            </tr>
        `;
    } catch (error) {
        console.error('Error fetching current user for user-page:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCurrentUserInfo();
});
