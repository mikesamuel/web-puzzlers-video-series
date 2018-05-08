export function enqueuePasswordResetEmail(data) {
  let email = `Dear ${data.displayName}, ${data.url} will let you reset your password.  Have an awesome day!`
  // Imagine the email is actually enqueued to the email of record for data.userId.
  console.log(`Sent password reset email to ${data.userId}`)
}
