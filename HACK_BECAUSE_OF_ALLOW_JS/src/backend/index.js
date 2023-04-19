import { $query, $update } from 'azle';
let messages = [];
$query;
export function getMessages() {
    return messages;
}
$update;
export function setMessage(newMessage) {
    messages.push(newMessage);
}
