/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/q78qlbK
 */
import { AccordionTrigger, AccordionContent, AccordionItem, Accordion } from "@/components/ui/accordion"

export function FAQ() {
  return (
    <Accordion className="w-full mt-4" type="multiple">
      <AccordionItem value="item-0">
        <AccordionTrigger className="hover:underline-none">
          What is ClubConnect?
        </AccordionTrigger>
        <AccordionContent className="text-white">
          ClubConnect is a solution designed to support your customers while reducing the load on your Front-Desk Team. Our Front-Desk Assistants help users understand facility services and offerings, providing real-time information. This allows your team to focus on enhancing the experience of in-person customers, knowing that those on the web are receiving accurate and timely answers.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger className="hover:underline-none">
          How does the chatbot adapt to changing information?
        </AccordionTrigger>
        <AccordionContent className="text-white">
          We use custom crawlers that are created to extract the information then this content is used to continusouly train the chatbot so it is providing the most up-to-date information.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger className="hover:underline-none">
          Are your front-desk assistants always available?
        </AccordionTrigger>
        <AccordionContent className="text-white">
          Yes, ClubConnect&apos;s front-desk assistants are available 24/7 to assist with any questions you or your customers might have at any time.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger className="hover:underline-none text-left">
          What kind of questions can I ask ClubConnect&apos;s Front-Desk Assistant ?
        </AccordionTrigger>
        <AccordionContent className="text-white">
          You can ask ClubConnect&apos;s Front-Desk Assistant about website navigation, services offered, troubleshooting, and more. It&apos;s here to ensure you find the information you need. We are working on integrations with software providers powering your club to further increase the possibilities of how Front-Desk Assistants are capable of aiding your customers.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-5">
        <AccordionTrigger className="hover:underline-none text-left">
          Does your Front-Desk Assistant replace human customer service?
        </AccordionTrigger>
        <AccordionContent className="text-white">
          ClubConnect&apos;s Front-Desk Assistant complements human customer service by handling straightforward questions and issues, allowing your human Front-Desk team to focus on more complex inquiries and enhancing in-person customer&apos;s experience.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-6">
        <AccordionTrigger className="hover:underline-none text-left">
          Which AI models does ClubConnect suuport in their Front-Desk Assistants?
        </AccordionTrigger>
        <AccordionContent className="text-white">
          We support the latest models from OpenAI with a focus on Stable Sanpshots so when updates are pushed you dont have to worry about how those will affect your Front-Desk Assistants, any updates to a new model for Front-Desk Assistants will be communicated ahead of time and our team will work with you to make sure your assistant improves along with the updated model. 
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
