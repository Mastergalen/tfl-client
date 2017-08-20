function NotInUKError(message) {
  this.name = 'NotInUKError';
  this.message = message || 'Location outside of UK';
  this.stack = (new Error()).stack;
}
NotInUKError.prototype = Object.create(Error.prototype);
NotInUKError.prototype.constructor = NotInUKError;

module.exports = NotInUKError;
