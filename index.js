import { gql, ApolloServer, UserInputError } from "apollo-server";

const persons = [
    {
        id: 1,
        name: 'Name 1',
        phone: '951319160',
        street: "Oaxaca",
        city: "Oaxaca",
    },
    {
        id: 2,
        name: 'Luis A',
        phone: '9511234567',
        street: "Oaxaca",
        city: "Oaxaca",
    },
    {
        id: 3,
        name: 'Beto V',
        street: "Oaxaca",
        city: "Oaxaca",
    }
];

const typeDefs = gql`
    enum YesNo {
        YES
        NO
    }

    type Address {
        street: String!
        city: String!
    }

    type Person {
        id: ID!
        name: String!
        phone: String
        address: Address!
    }

    type Query {
        personCount: Int!
        allPersons(phone: YesNo): [Person]!
        findPerson(name: String!): Person
    }

    type Mutation {
        addPerson(
            name: String!
            phone: String
            street: String!
            city: String!
        ): Person
        editPhone(
            name: String!
            phone: String!
        ): Person
    }
`

const resolvers = {
    Query: {
        personCount: () => persons.length,
        allPersons: (root, args) => {
            if(!args.phone) return persons;

            const byPhone = person => args.phone === 'YES' ? person.phone : !person.phone;

            return persons.filter(byPhone);
        },
        findPerson: (root, args) => {
            const { name } = args;
            return persons.find(item => item.name === name);
        } 
    },
    Person: {
        address: (root) => ({ street: root.street, city: root.city }),
    },
    Mutation: {
        addPerson: (root, args) => {
            if(persons.find(item => item.name === args.name)) {
                throw new UserInputError('Name must be unique', {
                    invalidArgs: args.name,
                });
            }
            const p = { ...args, id: new Date().getTime() }
            persons.push(p);
            return p;
        },
        editPhone: (root, args) => {
            const personIndex = persons.findIndex(item => item.name === args.name);
            if(personIndex === -1) throw new UserInputError('Name must be unique', {
                invalidArgs: args.name,
            });
            const updatedPerson = {...persons[personIndex], phone: args.phone};
            persons[personIndex] = updatedPerson;
            return updatedPerson
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
});

server.listen().then(({url}) => {
    console.log('server ready at', url );
})
