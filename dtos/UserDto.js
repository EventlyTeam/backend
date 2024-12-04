module.exports = class UserDto {
    email;
    id;
    isActivated;

    constructor(model) {
        this.email = model.email;
        this.id = model.id;
        this.emailVerified = model.emailVerified;
        this.role = model.Role.name;
    }
}