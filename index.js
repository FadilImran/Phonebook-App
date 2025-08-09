require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))
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

const date = new Date()
const formattedDate = date.toString()

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})

app.get('/info', (request, response) => {
    Person.find({}).then(people => {
        response.send(
            `<p>Phonebook has info for ${people.length} people</p>
            <p>${formattedDate}</p>`
        )
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person){response.json(person)}
        else {response.status(404).end()}
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    const contact = new Person({
        name: body.name, 
        number: body.number,
    })

    contact.save().then(savedContact => {
        response.json(savedContact)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const name = request.body.name
    const newNumber = request.body.number

    Person.findById(request.params.id).then(person => {
        if (!person){response.status(404).end()}

        person.name = name
        person.number = newNumber

        person.save().then(updatedContact => {
            response.json(updatedContact)
        })
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if(error.name === 'Cast Error') {
        return response.status(400).send({error: "malformed id"})
    }

    else if (error.name === "ValidationError") {
        return response.status(400).json({error: error.message})
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})