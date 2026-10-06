class NotFoundError(Exception):
    """Raised by services when a collection or record does not exist (mapped to HTTP 404)."""


class BadRequestError(Exception):
    """Raised by services for invalid input (mapped to HTTP 400)."""
