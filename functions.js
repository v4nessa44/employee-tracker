const inquirer = require('inquirer')
const consoleTable = require('console.table')



// View Departments Functioj
async function viewDepartments(connection) {

    const query = 'Select * from department'

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching table names:', err);
        } else {
            console.log();
            console.table(results)
        }
    })
}

// View All Roles Function
async function viewRoles(connection) {

    const query = `
        SELECT r.id, r.title, r.salary, d.name AS department
        FROM role AS r
        LEFT JOIN department AS d ON r.department_id = d.id
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching table names:', err);
        } else {
            console.log();
            console.table(results)
        }
    })

}

// View all employees Function
async function viewEmployees(connection) {

    const query = `
        SELECT
            e.id,
            e.first_name,
            e.last_name,
            r.title AS role,
            CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee AS e
        LEFT JOIN role AS r ON e.role_id = r.id
        LEFT JOIN employee AS m ON e.manager_id = m.id
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching table names:', err);
        } else {
            console.log();
            console.table(results)
        }
    })
}

// This is add Department Function
async function addDepartment(connection) {
    // Prompt the user to enter the department name
    const departmentName = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the department name:',
        },
    ]);


    // add it into database
    const query = 'INSERT INTO department (name) VALUES (?)';
    await connection.query(query, [departmentName.name]);

    console.log(`Department '${departmentName.name}' added successfully.`);
}

// This is Add a Role function
async function addRole(connection) {
    try {

        // Query the database to get a list of departments
        const departmentQuery = 'SELECT id, name FROM department';

        const departments = await new Promise((resolve, reject) => {
            connection.query(departmentQuery, (err, departments) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(departments);
                }
            });
        });

        // Create a list of department choices
        const departmentChoices = departments.map(department => ({
            name: department.name,
            value: department.id,
        }));

        // Prompt the user to enter role details, including selecting a department
        const roleDetails = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the Title name:',
            },
            {
                type: 'number',
                name: 'salary',
                message: 'Enter the role salary:',
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'Select the department for this role:',
                choices: departmentChoices,
            },
        ]);

        // Insert the role into the database
        const query = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';

        await connection.query(query, [roleDetails.title, roleDetails.salary, roleDetails.department_id]);

        console.log(`Role '${roleDetails.title}' added successfully.`);
    } catch (error) {
        console.error('Error adding role:', error);
    }
}

// This is a Function for adding an Employee
async function addEmployee(connection) {
    try {


        // Query the database to get lists of roles and employees (managers)
        const roleQuery = 'SELECT id, title FROM role';
        const managerQuery = 'SELECT id, first_name, last_name FROM employee';

        const [roles, managers] = await Promise.all([
            new Promise((resolve, reject) => {
                connection.query(roleQuery, (err, roles) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(roles);
                    }
                });
            }),
            new Promise((resolve, reject) => {
                connection.query(managerQuery, (err, managers) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(managers);
                    }
                });
            }),
        ]);

        // Create lists of role and manager choices
        const roleChoices = roles.map(role => ({
            name: role.title,
            value: role.id,
        }));
        const managerChoices = managers.map(manager => ({
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id,
        }));

        // Prompt the user to enter employee details, including selecting a role and manager
        const employeeDetails = await inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'Enter the First name:',
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'Enter the Last name:',
            },
            {
                type: 'list',
                name: 'role_id',
                message: 'Select the role for this employee:',
                choices: roleChoices,
            },
            {
                type: 'list',
                name: 'manager_id',
                message: 'Select the manager for this employee (or leave empty for no manager):',
                choices: [...managerChoices, { name: 'None', value: null }],
            },
        ]);

        // Insert the employee into the database
        const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);';

        await connection.query(query, [
            employeeDetails.firstName,
            employeeDetails.lastName,
            employeeDetails.role_id,
            employeeDetails.manager_id,
        ]);

        console.log(`Employee added successfully.`);
    } catch (error) {
        console.error('Error adding employee:', error);
    }
}

// This is update employee function
async function updateEmployee(connection) {
    try {

        // Query the database to get a list of employees and roles
        const employeeQuery = 'SELECT id, first_name, last_name FROM employee';
        const roleQuery = 'SELECT id, title FROM role';

        // get from databse
        const [employees, roles] = await Promise.all([
            new Promise((resolve, reject) => {
                connection.query(employeeQuery, (err, employees) => {
                    if (err) reject(err);
                    resolve(employees);
                });
            }),
            new Promise((resolve, reject) => {
                connection.query(roleQuery, (err, roles) => {
                    if (err) reject(err);
                    resolve(roles);
                });
            }),
        ]);

        // Create a list of employee choices
        const employeeChoices = employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
        }));

        // Create a list of role choices
        const roleChoices = roles.map(role => ({
            name: role.title,
            value: role.id,
        }));

        // Prompt the user to select an employee and the fields to update
        inquirer.prompt([
            {
                type: 'list',
                name: 'employee_id',
                message: 'Select the employee you want to update:',
                choices: employeeChoices,
            },
            {
                type: 'list',
                name: 'field_to_update',
                message: 'Select the field to update:',
                choices: ['First Name', 'Last Name', 'Role'],
            },
            {
                type: 'input',
                name: 'new_value',
                message: 'Enter the new value:',
                when: (answers) => answers.field_to_update !== 'Role',
            },
            {
                type: 'list',
                name: 'new_role_id',
                message: 'Select the new role:',
                choices: roleChoices,
                when: (answers) => answers.field_to_update === 'Role',
            },
        ]).then(userInput => {
            const { employee_id, field_to_update, new_value, new_role_id } = userInput;

            // Construct the update query based on the selected field
            let updateQuery, updateParams;

            switch (field_to_update) {
                case 'First Name':
                    updateQuery = 'UPDATE employee SET first_name = ? WHERE id = ?';
                    updateParams = [new_value, employee_id];
                    break;
                case 'Last Name':
                    updateQuery = 'UPDATE employee SET last_name = ? WHERE id = ?';
                    updateParams = [new_value, employee_id];
                    break;
                case 'Role':
                    updateQuery = 'UPDATE employee SET role_id = ? WHERE id = ?';
                    updateParams = [new_role_id, employee_id];
                    break;
            }

            // Execute the update query
            connection.query(updateQuery, updateParams, (err, result) => {
                if (err) {
                    console.error('Error updating employee:', err);
                } else {
                    console.log(`Employee with ID ${employee_id} has been updated.`);
                }
            });
        });
    } catch (error) {
        console.error('Error updating employee:', error);
    }
}



module.exports = {
    viewDepartments,
    viewRoles,
    viewEmployees,
    addRole,
    addEmployee,
    addDepartment,
    updateEmployee
}