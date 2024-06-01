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
          ClubConnect is a solution designed to help your customers while relieving pressure on your Front-Desk Team, assist with understanding facility services & offerings, and provide information to users in real-time. It allows your team to focus on enriching the experience of in-person customers, while having peace of mind that those on the website and calling are getting the answers they are looking for.
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
        <AccordionContent className="text-muted-foreground">
          Yes, ClubConnect&apos;s front-desk assistants are available 24/7 to assist with any questions you or your customers might have at any time.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger className="hover:underline-none text-left">
          What kind of questions can I ask ClubConnect&apos;s Front-Desk Assistant ?
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          You can ask ClubConnect&apos;s Front-Desk Assistant about website navigation, services offered, troubleshooting, and more. It&apos;s here to ensure you find the information you need. We are working on integrations with software providers powering your club to further increase the possibilities of how Front-Desk Assistants are capable of aiding your customers.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem className="border-b-0" value="item-5">
        <AccordionTrigger className="hover:underline-none text-left">
          Does your Front-Desk Assistant replace human customer service?
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          ClubConnect&apos;s Front-Desk Assistant complements human customer service by handling straightforward questions and issues, allowing our human team to focus on more complex inquiries and enhancing in-person customer&apos;s experience.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem className="border-b-0" value="item-6">
        <AccordionTrigger className="hover:underline-none">
          ClubConnect&apos;s Front-Desk Assistant complements human customer service by handling straightforward questions and issues, allowing our human team to focus on more complex inquiries and enhancing in-person customer&apos;s experience.
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          We support the latest models from OpenAI with a focus on Stable Sanpshots so when updates are pushed you dont have to worry about how those will affect your Front-Desk Assistants, any updates to a new model for Front-Desk Assistants will be communicated ahead of time and our team will work with you to make sure your assistant improves along with the updated model. 
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
