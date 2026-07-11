export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const res = await fetch(`${process.env.API_URL}${url}`, options)
  const data = await res.json().catch(() => undefined)

  return { status: res.status, data, headers: res.headers } as T
}
