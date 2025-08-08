const express = require('express')
var morgan = require('morgan')

const app = express()

app.use(express.json())

morgan.token("data", (request) => {
    if(request.method === "POST"){
        return JSON.stringify({
            name: request.body.name,
            number: request.body.number
        })
    }
    return
})

morgan.token("ContentLength", (request) => {return String(request.get('Content-Length'))})

app.use(morgan(':method :url :status :ContentLength - :response-time ms :data'))

app.use(express.static('dist'))

let contacts = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const date = new Date()
const formattedDate = date.toString()

app.get('/api/persons', (request, response) => {
    response.json(contacts)
})

app.get('/info', (request, response) => {
    response.send(
        `<p>Phonebook has info for ${contacts.length} people</p>
        <p>${formattedDate}</p>`
    )
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const contact = contacts.find(person => person.id === id)

    if(contact){
        response.json(contact)
    }
    else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    contacts = contacts.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const Pid = Math.round(Math.random() * 100)
    const body = request.body

    if(!body.name){
        return response.status(400).json({
            error: "name missing"
        })
    }

    else if(!body.number){
        return response.status(400).json({
            error: "number missing"
        })
    }

    else if(contacts.find(person => person.name === body.name)){
        return response.status(400).json({
            error: "name must be unique"
        })
    }

    const contact = {
        name: body.name, 
        number: body.number,
        id: String(Pid),
    }

    contacts = contacts.concat(contact)

    response.json(contact)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})