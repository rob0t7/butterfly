# Butterfly critique solution

## Approach

### 1. Update dependencies

In order to use newer library features and `prettier.js` autoformatting. The updates are backwards compatible.

### 2. Implement Butterfly retrieval use-case

Out of the two use-cases that need to be implemented, the retrieval of the
Butterfly collection is simpler. First I needed to design the RESTful endpoint.

Following good REST practices I settled on the following URL:

`GET /butterflies?userId=<userID>`

This allows the usage of the querystring portion of the URL. If the `userId=` querystring is not present,
the end-user retrieves all the Butterfly resources. If the `userId=` querystring is present, a collection
of Butterfly resources is returned for all butterflies ranked by the `userId` sorted in descending rank order.

First I created the system level API test. This allows refactoring to ensure the REST api always works.

### 3. Refactor code into a light domain model

Second I refactored the Butterfly specific code to use

1. A Butterfly domain model
2. A Butterfly Repository

The Butterfly domain model is trivial at this point, but it does allow the user the submit a ranking. I got ahead of myself, but this functionality will be exposed in the second use-case. The model also allows better type safety, even though JS is dynamically typed.

The Repository allows the retrieval and insertion of data to be abstracted behind a stable interface. It implements the [Repository Design Pattern](https://martinfowler.com/eaaCatalog/repository.html). In the future this allows the domain model
to be tested without any infrastructure concerns, specifically the data layer. The repository implementation can be switched out, as long as the interface stays the same. The repository pattern works with the Butterfly Domain model.


### 4. Rank Butterflies

In this step I implemented the rank use-case. A user should be able to submit a rating for a particular butterfly. If the user submits the rating again, the newest rating should always be used. 

The URL that makes the most sense is `PUT /butterflies/:id/rating`. This is to ensure that the user can only submit 1 rating per butterfly. The payload consists of:

```javascript
{
  "userId": "some-user-id", // a userId must exist in the DB
  "rating": 3 // a rating between 0 and 5
}
```

Ideally the userId would be part of the request authorization token header, like a bearer token. But since I am limited in time, I made it part of the payload. This obviously is not the most secure, but it functionally works. If the auth token was implemented, then the payload would only consist of the rating. T

The reason for the **PUT**, is that the request is idempotent. It will either create the rating if it does not exist, or over-write it if it already exists. It is safer to user than **POST**. The rating resource is singular since the user can only submit 1 rating per butterfly.

Again the code was written using a TDD approach, first focusing on the sad path.

The sad path tests could be pushed down to the domain layer as unit tests which makes the tests faster to run and easier to maintain. Thus only 1 sad path test exists in the _web layer_.