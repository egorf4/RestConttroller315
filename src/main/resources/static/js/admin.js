const adminApiBaseUrl = '/admin/api';
const userApiBaseUrl = '/user/api';
const usersUrl = `${adminApiBaseUrl}/users`;
const rolesUrl = `${adminApiBaseUrl}/roles`;
const currentUserUrl = `${userApiBaseUrl}`;

const usersTableBody = document.querySelector('#usersTable tbody');
const newUserForm = document.getElementById('newUserForm');
const rolesSelectNew = document.getElementById('rolesNew');
const modalsContainer = document.getElementById('modalsContainer');
const currentUserEmail = document.getElementById('currentUserEmail');
const currentUserRoles = document.getElementById('currentUserRoles');

const adminLink = document.getElementById('adminLink');
const userLink = document.getElementById('userLink');

const adminSection = document.getElementById('adminSection');
const userSection = document.getElementById('userSection');

const adminInfoTableBody = document.querySelector('#adminInfoTable tbody');

async function getCurrentUser() {
    try {
        const response = await fetch(currentUserUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const user = await response.json();
        currentUserEmail.textContent = user.email;
        currentUserRoles.innerHTML = '';
        user.roles.forEach(role => {
            const roleName = role.name.replace('ROLE_', '');
            const span = document.createElement('span');
            span.classList.add('badge', 'bg-secondary', 'me-1');
            span.textContent = roleName;
            currentUserRoles.appendChild(span);
        });
        return user;
    } catch (error) {
        console.error('Error fetching current user:', error);
    }
}


async function loadUsers() {
    try {
        const response = await fetch(usersUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        usersTableBody.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.surname}</td>
                <td>${user.age}</td>
                <td>${user.email}</td>
                <td>${user.roles.map(role => role.name.replace('ROLE_', '')).join(', ')}</td>
                <td>
                    <button class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#editUserModal${user.id}">Edit</button>
                    <button class="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#deleteUserModal${user.id}">Delete</button>
                </td>
            `;
            usersTableBody.appendChild(tr);
            createEditModal(user);
            createDeleteModal(user);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}


async function loadRoles(selectElement) {
    try {
        const response = await fetch(rolesUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const roles = await response.json();
        selectElement.innerHTML = '';
        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id;
            option.textContent = role.name.replace('ROLE_', '');
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
    }
}


function createEditModal(user) {
    const modal = document.createElement('div');
    modal.classList.add('modal', 'fade');
    modal.id = `editUserModal${user.id}`;
    modal.tabIndex = -1;
    modal.innerHTML = `
    <div class="modal-dialog">
        <div class="modal-content">
            <form id="editUserForm${user.id}">
                <div class="modal-header">
                    <h5 class="modal-title">Edit User</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" name="id" value="${user.id}" />
                    <div class="mb-3">
                        <label for="editName${user.id}">First Name</label>
                        <input type="text" id="editName${user.id}" name="name" class="form-control" value="${user.name}" />
                    </div>
                    <div class="mb-3">
                        <label for="editSurname${user.id}">Last Name</label>
                        <input type="text" id="editSurname${user.id}" name="surname" class="form-control" value="${user.surname}" />
                    </div>
                    <div class="mb-3">
                        <label for="editAge${user.id}">Age</label>
                        <input type="number" id="editAge${user.id}" name="age" class="form-control" value="${user.age}" />
                    </div>
                    <div class="mb-3">
                        <label for="editEmail${user.id}">Email</label>
                        <input type="email" id="editEmail${user.id}" name="email" class="form-control" value="${user.email}" />
                    </div>
                    <div class="mb-3">
                        <label for="editPassword${user.id}">Password</label>
                        <input type="password" id="editPassword${user.id}" name="password" class="form-control" placeholder="Enter new password (leave blank to keep current)">
                    </div>
                    <div class="mb-3">
                        <label for="editRoles${user.id}">Roles</label>
                        <select multiple id="editRoles${user.id}" name="roles" class="form-select">
                            <!-- Roles will be loaded dynamically -->
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div>
    `;
    modalsContainer.appendChild(modal);

    const rolesSelect = modal.querySelector(`#editRoles${user.id}`);
    loadRoles(rolesSelect).then(() => {
        const userRoleIds = user.roles.map(role => role.id);
        for (let option of rolesSelect.options) {
            if (userRoleIds.includes(parseInt(option.value))) {
                option.selected = true;
            }
        }
    });

    const editForm = document.getElementById(`editUserForm${user.id}`);
    editForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(editForm);
        const updatedUser = {
            id: formData.get('id'),
            name: formData.get('name'),
            surname: formData.get('surname'),
            age: formData.get('age'),
            email: formData.get('email'),
            password: formData.get('password') || null,
            roles: Array.from(rolesSelect.selectedOptions).map(option => ({
                id: parseInt(option.value),
                name: `ROLE_${option.textContent}`
            }))
        };

        if (!updatedUser.password) {
            delete updatedUser.password;
        }

        try {
            const response = await fetch(usersUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            });
            if (response.ok) {
                bootstrap.Modal.getInstance(modal).hide();
                loadUsers();
            } else {
                console.error('Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    });
}

function createDeleteModal(user) {
    const modalId = `deleteUserModal${user.id}`;
    const modal = document.createElement('div');
    modal.classList.add('modal', 'fade');
    modal.id = modalId;
    modal.tabIndex = -1;
    modal.innerHTML = `
    <div class="modal-dialog">
        <div class="modal-content">
            <form id="deleteUserForm${user.id}">
                <div class="modal-header">
                    <h5 class="modal-title">Delete User</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" name="id" value="${user.id}" />
                    <div class="mb-3">
                        <label><strong>ID:</strong></label>
                        <input type="text" class="form-control" value="${user.id}" readonly>
                    </div>
                    <div class="mb-3">
                        <label><strong>First Name:</strong></label>
                        <input type="text" class="form-control" value="${user.name}" readonly>
                    </div>
                    <div class="mb-3">
                        <label><strong>Last Name:</strong></label>
                        <input type="text" class="form-control" value="${user.surname}" readonly>
                    </div>
                    <div class="mb-3">
                        <label><strong>Age:</strong></label>
                        <input type="text" class="form-control" value="${user.age}" readonly>
                    </div>
                    <div class="mb-3">
                        <label><strong>Email:</strong></label>
                        <input type="email" class="form-control" value="${user.email}" readonly>
                    </div>
                    <div class="mb-3">
                        <label><strong>Roles:</strong></label>
                        <select class="form-select" multiple disabled>
                            ${user.roles.map(role => `<option selected>${role.name.replace('ROLE_', '')}</option>`).join('')}
                        </select>
                    </div>
                    <p class="text-danger">Are you sure you want to delete this user?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-danger">Delete</button>
                </div>
            </form>
        </div>
    </div>
    `;
    modalsContainer.appendChild(modal);

    const deleteForm = document.getElementById(`deleteUserForm${user.id}`);
    deleteForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${usersUrl}/${user.id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const modalEl = document.getElementById(modalId);
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) {
                    modalInstance.hide();
                }
                await loadUsers();
            } else {
                console.error('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    });
}
adminLink.addEventListener('click', (e) => {
    e.preventDefault();
    adminLink.classList.add('active');
    userLink.classList.remove('active');
    adminSection.style.display = 'block';
    userSection.style.display = 'none';
});

userLink.addEventListener('click', async (e) => {
    e.preventDefault();
    userLink.classList.add('active');
    adminLink.classList.remove('active');
    adminSection.style.display = 'none';
    userSection.style.display = 'block';
    await loadAdminInfo();
});

async function loadAdminInfo() {
    try {
        const response = await fetch(currentUserUrl);
        const admin = await response.json();
        adminInfoTableBody.innerHTML = `
            <tr>
                <td>${admin.id}</td>
                <td>${admin.name}</td>
                <td>${admin.surname}</td>
                <td>${admin.age}</td>
                <td>${admin.email}</td>
                <td>${admin.roles.map(role => role.name.replace('ROLE_', '')).join(', ')}</td>
            </tr>
        `;
    } catch (error) {
        console.error('Error fetching admin info:', error);
    }
}

newUserForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(newUserForm);
    const newUser = {
        name: formData.get('name'),
        surname: formData.get('surname'),
        age: parseInt(formData.get('age')),
        email: formData.get('email'),
        password: formData.get('password'),
        roles: Array.from(rolesSelectNew.selectedOptions).map(option => ({ id: parseInt(option.value), name: `ROLE_${option.textContent}` })),
    };

    try {
        const response = await fetch(usersUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
        });
        if (response.ok) {
            newUserForm.reset();
            document.querySelector('#users-tab').click();
            loadUsers();
        } else {
            console.error('Failed to create user');
        }
    } catch (error) {
        console.error('Error creating user:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    getCurrentUser();
    loadUsers();
    loadRoles(rolesSelectNew);
});
