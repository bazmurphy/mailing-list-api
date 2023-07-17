# Mailing List REST API

_**Credit:** This challenge was created by [Techtonica](https://github.com/Techtonica/curriculum). You can find the original [on the Techtonica Curriculum](https://github.com/Techtonica/curriculum/blob/main/api/REST-API.md)._

## Previous Knowledge & Difficulty

To complete this challenge you should be able to

- Create a `Node` Application
- Use `Express` to setup endpoints
- Understand what a `GET` & `PUT` Request are and how to use them using `Fetch`

This challenge is rated at **Easy to Medium**.

# Mailing List REST API

## Tools

You should create an Express app. All of this can be in-memory, no database or file storage needed.

## Data

The data consists of mailing lists which have a name and an array of member email addresses.

```json
{
  "name": "staff",
  "members": ["talea@techtonica.org", "michelle@techtonica.org"]
}
```

You can find some sample data in the `mailing-lists.js` file.

## Routes

### Index

#### Route

`/lists` - fetch all the existing list names

#### Response

- 200 with a JSON body of all the existing list names
- 200 and empty array if none exist (not a 404)

#### Response Body

```json
["staff", "cohort-h1-2020"]
```

#### Example Express Code

```javascript
const lists = new Map();
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

// add some fake data

app.get("/lists", (req, res) => {
  const listsArray = Array.from(lists.keys()); // Why is this like this? Try it out in your console.
  res.send(listsArray);
});
```

### GET single list

#### Route

`/lists/:name` - get list by name, e.g. `/lists/staff`

#### Response

- 200 with a JSON body (name and member emails) of the given list
- 404 if not found

#### Response Body

```json
{
  "name": "staff",
  "members": ["talea@techtonica.org", "michelle@techtonica.org"]
}
```

While the frontend code is correct, the backend is not set up and will error (specifically `POST`, `PUT` and `DELETE`). Do not worry if you can not make it work, please follow along with the code and make sure you understand what is going on. The goal of this exercise is for you to understand how to set up routes so don't worry too much about the logic yet, we will get to that in future lessons.

### DELETE single list

#### Route

`/lists/:name` - delete list by name

##### Response

- 200 if successfully deleted
- 404 if not found to delete

#### Response Body

None needed

### PUT - update single list

#### Path

`/lists/:name` - add or update a list with the given name

#### Request Body

```json
{
  "name": "my-new-list",
  "members": ["me@me.com"]
}
```

#### Response

- 200 if it updated a list that already existed
- 201 if it created a new list

#### Response Body

None

#### Stretch 1

What if the name in the path doesn't match the one in JSON body?? Sounds like an error case to me. Detect this case and pick an [appropriate status code](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#4xx_Client_errors). (hint: if the client did something wrong in the request, it'll be 4xx)

## Testing

Use Postman to test retrieving, saving, and deleting mailing lists using your API.

## Stretch 2

Some would say the more REST-ful way to manage the members of the list is to make them into a resource.

After creating your pull request in this coursework repo, try this challenge!

- `GET /lists/:name/members` => return array of emails only for a list
- `PUT /lists/:name/members/:email` => make the supplies email a member of the list
- `DELETE /lists/:name/members/:email` => remove the supplied email as a member of the list

### Sidebar PUT vs. POST

API's often use POST and PUT for updates. They have slightly different meanings. This [side-by-side comparison](https://restfulapi.net/rest-put-vs-post/) can be helpful but don't get too hung up on that at this stage.

- `POST /lists/:name/members` with a body containing an email will add it to the list, even if it's already there
