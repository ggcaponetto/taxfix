const isLogEnabled = false;

export default function log(msg, obj) {
  return isLogEnabled ? console.log(msg, obj) : null;
}
