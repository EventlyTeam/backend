module.exports = class UserDto {
    email;
    id;
    emailVerified;
    role;

    constructor(model) {
        this.email = model.email;
        this.id = model.id;
        this.emailVerified = model.emailVerified;
        this.role = model.Role.name;
    }
}