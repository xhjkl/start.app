//
//  Make unsafe URI or path substring into concatenation-safe one
//
import * as path from 'path'

/** Return relativized resolved path no shallower than root */
export default function purifyPath (unsafePath: string) {
  const root = '/'
  return path.relative(root, path.resolve(root, unsafePath))
}
