import {$query, $update, Record, Vec} from 'azle';

export type Message = Record<{
    message: string;
    principal: string;
    date: string;
}>;

let messages: Message[] = [];
$query;

export function getMessages(): Vec<Message> {
    return messages;
}

$update;

export function setMessage(newMessage: Message): void {
    messages.push(newMessage);
}