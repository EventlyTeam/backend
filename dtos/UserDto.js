module.exports = class UserDto {
    email;
    id;
    isActivated;

    constructor(model) {
        this.email = model.email;
        this.id = model.id;
        this.emailVerified = model.emailVerified;
        this.roleId = model.roleId;
    }
}