//
//  Styles for the whole body
//
import { injectGlobal } from 'styled-components'

export default injectGlobal`html, body, #root {
  font: 100% sans-serif;
  background: hsl(0, 0%, 97%);
  display: flex;
  flex-direction: column;
  min-width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}
`
