import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export const exportSession = async (
  json: string,
  template: string,
  output: string
): Promise<void> => {
  try {
    const zip = new JSZip()
    
    zip.file('mock-data.json', json)
    zip.file('template.mustache', template)
    zip.file('output.json', output)
    
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'mustache-session.zip')
  } catch (error) {
    throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
