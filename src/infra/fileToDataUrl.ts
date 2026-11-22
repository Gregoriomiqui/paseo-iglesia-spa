/** Lee un archivo como data URL ("data:image/png;base64,..."). */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el archivo'))
    reader.readAsDataURL(file)
  })
}
