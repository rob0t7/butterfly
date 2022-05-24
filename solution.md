# Butterfly critique solution

For this assignment some high level assumptions have been made. 

The biggest assumption was to solely focus on the
main API implementation and not the evolution of the RESTful schema. The REST API forms a contract between the clients 
and server and should get more attention. It is important that the interface is **stable**. This interface is what both sides
of the equation will test against. It can also be used for [contract testing](https://docs.pact.io/). This is where a standard IDL 
language like [OpenAPI](https://www.openapis.org/) could be used to describe the interface. For the sake of time, this was **not** 
in scope of this assignment.

Another assumption made was not to focus on the error handling, or pagination. In real world scenarios it would be best practices
to have more informative error messages, especially concerning user input validation. There are a few hypermedia types that could
be used such as [JSON:API](https://jsonapi.org) or a combination of [HAL](https://stateless.group/hal_specification.html) + [vnd.error](https://github.com/blongden/vnd.error). These media types follow more strict rules for the structure of messages
which is important for large projects. The error handling could also be refactored into using express.js middleware to DRY 
up the codebase.

No authentication was implemented as part of the exercise. In the real world the actions of user should be scoped to their
identity. The most common mechanism is either OAuth2 or OpenID Connect (which is a superset of OAuth2). Use of auth tokens
would require minor refactoring of the code submitted.

I also choose to approach the code by implmenting a small domain layer. I find that I can drastically simplify the core logic
and testing by introducing this small layer. Effectively the web layer forms an adapter to the main use-cases. An example of 
this is implemented in the _butterfly_ actions. I choose not to do the same treatment for _user_ resources to provided that
contrast. I also choose to implment a more OOP approach. This also allows other inputs to execute the domain logic in the future
outside of just HTTP.

To facilitate some newer features in JS, I have choosen to upgrade
the Node to the latest LTS release (v16) so that I can expose es2022 functionality without the need for a polyfill. I also
find OOP to be easier to maintain domain model invariants but I do understand that this can also be implmented using FP. FP 
can be discussed more during the interview if you are interested.

Also no logging, metrics, tracing or other observability was implemented as part of this exercise.

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

Another approach that could have been taken is the URL: `GET /users/:user-id/butterflies`.

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

Since the User resource is needed for this action. A small _UserRepository_ was refactored.

### 5. Refactoring

While refactoring was done in all steps, the final steps organized the code into themes. This allows readers to faster locate what section
of code they are working on. I also choose to expose a use-case module for the butterfly actions. This demonstrates how the domain logic of
the application could be driven by more than just HTTP inputs, such as an event listener or CLI. The design of the application architecture
mostly follows hexagonal / ports-and-adapters design pattern.