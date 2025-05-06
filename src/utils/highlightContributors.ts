export function highlight(text: string, names: string[], color: string) {
  const pattern = new RegExp(`\\b(${names.join("|")})\\b`, "g");
  return text.replace(pattern, `<span style="color:${color}">$1</span>`);
}
