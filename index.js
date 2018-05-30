const db = require('sqlite')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080

// DATABASE
db.open('expressapi.db').then(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (pseudo, email, firstname, lastname, createdAt, updatedAt)')
    .then(() => {
      console.log('> Database ready')
    }).catch((err) => { // Si on a eu des erreurs
      console.error('ERR> ', err)
    })
});




// BODY PARSER
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(methodOverride('_method'))
app.set('views', './views')
app.set('view engine', 'pug')





// LOGGER
app.use((req, res, next) => {
  next()
  console.log('REQUEST: ' + req.method + ' ' + req.url)
})





// DEFAULT ROUTE
app.get('/', (req, res, next) => {
    res.render('main',{
        title: 'Bonjour !',
        name: 'Toto',
        content: 'Ma première page'
    })
})





// GET ALL USERS
app.get('/users', (req, res, next) => {
  const limit = `LIMIT ${req.query.limit || 100}`
  const offset = `OFFSET ${ req.query.offset || 0}`
  query = `SELECT * FROM users ${limit} ${offset}`

  db.all(query)
  .then((users) => {
    res.render('index',{
        title: 'Affichage de tous les users',
        content: users
    })
  }).catch(next)
})




// POST USER
app.post('/users', (req, res, next) => {
  if(!req.body.pseudo || !req.body.email || !req.body.firstname || !req.body.lastname) {
    next(new Error('All fields must be given.'))
  }
  db.run("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)", req.body.pseudo, req.body.email, req.body.firstname, req.body.lastname, new Date(), null)
.then(()=> {
  res.redirect('/users')
  })
})


app.get('/users/add', (req, res, next) => {
    res.render('edit',{
        title:  'Ajout',
        user: {
            pseudo: '',
            email: '',
            firstname: '',
            lastname: '',
        }
    })
})



// GET USER BY ID
app.get('/users/:userId', (req, res, next) => {
  db.get('SELECT * FROM users WHERE ROWID = ?', req.params.userId)
  .then((user) => {
    res.render('show', {
        title: 'Affichage',
        usr : user,
        userId: req.params.userId
    })
  }).catch(next)
})



// DELETE USER
app.delete('/users/:userId', (req, res, next) => {
  db.run('DELETE FROM users WHERE ROWID = ?', req.params.userId)
  .then(() => {
    res.redirect('/users')
  }).catch(next)
})





// UPDATE USER
app.put('/users/:userId', (req, res, next) => {
    console.log('jepassse')
  db.run("UPDATE users SET pseudo = ?, email = ?, firstname = ?, lastname = ?, updatedAt= ? WHERE rowid = ?",req.body.pseudo, req.body.email, req.body.firstname, req.body.lastname, new Date(), req.params.userId)
  .then(() => {
    res.send('OK')
  }).catch(next)
})

app.get('/users/:userId/edit', (req, res, next) => {
    db.get('SELECT * FROM users WHERE ROWID = ?', req.params.userId)
    .then((user)=>{
        res.render('edit',{
            user: user,
            userId: req.params.userId
        })
    })
})


// ERROR
app.use((err, req, res, next) => {
  console.log('ERR: ' + err)
  res.status(500)
  res.send('Server Error')
})

// 404
app.use((req, res) => {
  res.status(501)
  res.end('Not implemented')
})

app.listen(PORT, () => {
  console.log('Server running on port: ' + PORT)
})