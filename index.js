// Employee Record management Application CLI
const inquirer = require('inquirer')
const { viewDepartments, viewEmployees, viewRoles, addDepartment, addRole, addEmployee, updateEmployee } = require('./functions')
const mysql = require('mysql')


// db connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootroot',
    database: 'employee_db'
})

connection.connect((err) => {
    if (err) throw err
    console.log('Connect to the database');
})



async function start() {

    while (true) {
        // Take action choice from User
        const { action } = await inquirer.prompt([
            {
                name: 'action',
                type: 'list',
                message: 'What would you like to do?',
                choices: [
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'Update an employee role',
                    'Exit'
                ]

            }

        ])


        // Based on choice, Do the action

        switch (action) {

            case 'View all departments':
                await viewDepartments(connection)
                break;
            case 'View all roles':
                await viewRoles(connection)
                break;
            case 'View all employees':
                await viewEmployees(connection)
                break;
            case 'Add a department':
                await addDepartment(connection)
                break;
            case 'Add a role':
                await addRole(connection)
                break;
            case 'Add an employee':
                await addEmployee(connection)
                break;
            case 'Update an employee role':
                updateEmployee(connection)
                break;
            case 'Exit':
                console.log('Goodbye!');
                process.exit();
        }
    }
}


// start of tool
start()