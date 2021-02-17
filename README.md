###### In order to run app execute command:

**docker-compose up**

###### API:

**GET /api/zombies** - fetch all zombies

**GET /api/zombies/{id}** - fetch one zombie by id

**POST /api/zombies** | {name: string} - create zombie

**PUT /api/zombies/{id}** | {name: string} - update zombie

**DELETE /api/zombies/{id}** - delete zombie

**GET /api/zombies/{id}/items** - fetch zombie items

**POST /api/zombies/{id}/items** | {itemId: number} - add item to zombie

**DELETE /api/zombies/{id}/items/{itemId}** - remove item from zombie

**GET /api/zombies/{id}/total** - get total items value for specific zombie
