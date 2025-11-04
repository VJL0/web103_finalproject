# Entity Relationship Diagram

Reference the Creating an Entity Relationship Diagram final project guide in the course portal for more information about how to complete this deliverable.

## Create the List of Tables

[👉🏾👉🏾👉🏾 List each table in your diagram]
entity_relationship_diagram: https://dbdiagram.io/d/6902d6dc6735e11170680935
- flashcard, category, user

## Add the Entity Relationship Diagram

[👉🏾👉🏾👉🏾 Include an image or images of the diagram below. You may also wish to use the following markdown syntax to outline each table, as per your preference.]

| Column Name | Type | Description |
|-------------|------|-------------|
| id | integer | primary key |
| name | text | name of the shoe model |
| ... | ... | ... |

<img width="191" height="191" alt="image" src="https://github.com/user-attachments/assets/72dcb159-3b7f-45d4-b39d-f673f53e94a6" />


Table flashcard {
  id integer [primary key]
  categoryId int
  question text
  answer text
  image text
  created_at timestamp
}

Table category {
  id integer [primary key]
  user_id integer [ref: > user.id]
  title varchar
  description text            
  is_public boolean   
  created_at timestamp
  updated_at timestamp
}

Table user {
  id integer [primary key]
  name varchar
  email varchar unique      
  favorites integer[]  
  money numeric(10,2) 
  streak_start timestamp
  last_visited timestamp
  created_at timestamp
  updated_at timestamp
}

