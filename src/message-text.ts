import { president_role } from "./discord-ids.json"

export default function get_message_text(id: unknown, bill_text: unknown, upvotes: unknown, downvotes: unknown, bill_type: unknown){
  if (bill_type == 1){
    return `Bill #${id}: Ban <@${bill_text}> :arrow_up::${upvotes} :arrow_down::${downvotes} @everyone`
  }else{
    return`Bill #${id}: ${bill_text} :arrow_up::${upvotes} :arrow_down::${downvotes} @everyone`
  }
}

export function get_message_text_president(id: unknown, bill_text: unknown, bill_type: unknown){
   if (bill_type == 1){
    return `New Bill! #${id}: Ban <@${bill_text}> <@&${president_role}>`
  }else{
    return `New Bill! #${id}: ${bill_text} <@&${president_role}>`
  }
}

export function get_message_text_law(id: unknown, law_text: unknown, bill_type: unknown, username: string | null){
  if (bill_type == 1){
    return `#${id}: ${username} is banned`
  }else {
    return `##{id}: ${law_text}`
  }
}
