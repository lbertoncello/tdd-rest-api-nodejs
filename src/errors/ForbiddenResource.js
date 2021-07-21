module.exports = function ForbiddenResourceError
(message = 'Este recurso não pertecene ao usuário.') {
	this.name = 'ForbiddenResourceError';
	this.message = message;
};
