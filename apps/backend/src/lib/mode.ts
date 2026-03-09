export function isSaaS(): boolean {
  return process.env.APP_MODE === 'saas';
}

export function isSelfHosted(): boolean {
  return !isSaaS();
}
