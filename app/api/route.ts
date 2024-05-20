
export const dynamic = 'force-dynamic' // defaults to auto

export async function GET(request: Request) {
    return new Response('Hello, ClubConnect Front-Desk Assistant!', {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    })
}