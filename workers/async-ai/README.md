# Async AI worker

Writing and tutor work that exceeds an HTTP request budget belongs here. Each job
contains an internal submission ID, not a raw client-supplied answer key. The worker
loads canonical context server-side, invokes the configured provider and validates
the resulting structured output before persistence.
