# RESTful Service API Documentation

This document provides detailed information about the API endpoints for the OpenMusic service.

## Authentication

This API uses JSON Web Tokens (JWT) for authentication. To access protected endpoints, you need to include an Access Token in the `Authorization` header of your request, using the `Bearer` scheme.

**Example:** `Authorization: Bearer <your_access_token>`

Access Tokens are short-lived. When an Access Token expires, you must use a Refresh Token to obtain a new Access Token. Refresh Tokens are long-lived and should be stored securely by the client.

The `/authentications` endpoints are used to log in (obtain tokens), refresh an Access Token, and log out (invalidate a Refresh Token).

---

## Exports API

The Exports API allows authenticated users to export their playlists to an email address. This process is asynchronous, utilizing a message broker. This endpoint requires authentication using a Bearer Token.

### 1. Export Playlist

* **Purpose:** Initiates a request to export a specific playlist's songs to the target email address. Only the playlist owner can perform this action. The actual export is handled asynchronously by a separate consumer service.
* **Method:** `POST`
* **Path:** `/export/playlists/{playlistId}`
* **Authentication:** Requires Authentication (Bearer Token)

#### Path Parameters

| Parameter    | Type   | Description                            | Required |
| :----------- | :----- | :------------------------------------- | :------- |
| `playlistId` | string | The ID of the playlist to be exported. | Yes      |

#### Request Body

The request body must be a JSON object with the following property:

| Parameter     | Type   | Description                                         | Required |
| :------------ | :----- | :-------------------------------------------------- | :------- |
| `targetEmail` | string | The email address to send the exported playlist to. | Yes      |

**Example Request:**

```json
{
  "targetEmail": "user@example.com"
}
```

#### Responses

* **Success (201 Created):** Indicates the export request has been successfully queued.

    ```json
    {
      "status": "success",
      "message": "Permintaan Anda sedang kami proses"
    }
    ```

* **Error (400 Bad Request):** If the payload is invalid (e.g., missing or invalid `targetEmail`).

    ```json
    {
      "status": "fail",
      "message": "\"targetEmail\" must be a valid email" // Or other validation messages
    }
    ```

* **Error (401 Unauthorized):** If the request lacks a valid Access Token.
* **Error (403 Forbidden):** If the authenticated user is not the owner of the playlist.

    ```json
    {
        "status": "fail",
        "message": "Anda tidak berhak mengakses resource ini"
    }
    ```

* **Error (404 Not Found):** If the `playlistId` does not exist.

    ```json
    {
        "status": "fail",
        "message": "Playlist tidak ditemukan"
    }
    ```

---

## Collaborations API

The Collaborations API allows authenticated users (playlist owners) to manage collaborations on their playlists. All endpoints in this section require authentication using a Bearer Token.

### 1. Add Collaboration

* **Purpose:** Adds a user as a collaborator to a specific playlist. Only the playlist owner can perform this action.
* **Method:** `POST`
* **Path:** `/collaborations`
* **Authentication:** Requires Authentication (Bearer Token)

#### Request Body

The request body must be a JSON object with the following properties:

| Parameter    | Type   | Description                                      | Required |
| :----------- | :----- | :----------------------------------------------- | :------- |
| `playlistId` | string | The ID of the playlist to add a collaborator to. | Yes      |
| `userId`     | string | The ID of the user to add as a collaborator.     | Yes      |

**Example Request:**

```json
{
  "playlistId": "playlist-xxxxxxxxx",
  "userId": "user-yyyyyyyyy"
}
```

#### Responses

* **Success (201 Created):**

    ```json
    {
      "status": "success",
      "data": {
        "collaborationId": "collab-zzzzzzzzz"
      }
    }
    ```

* **Error (400 Bad Request):** If the payload is invalid (e.g., missing `playlistId` or `userId`).

    ```json
    {
      "status": "fail",
      "message": "Payload tidak valid" // Generic or specific validation message
    }
    ```

* **Error (401 Unauthorized):** If the request lacks a valid Access Token.
* **Error (403 Forbidden):** If the authenticated user is not the owner of the playlist.

    ```json
    {
        "status": "fail",
        "message": "Anda tidak berhak mengakses resource ini"
    }
    ```

* **Error (404 Not Found):** If the `playlistId` or `userId` does not exist.

    ```json
    {
        "status": "fail",
        "message": "Playlist tidak ditemukan" // or "User tidak ditemukan"
    }
    ```

### 2. Delete Collaboration

* **Purpose:** Removes a user as a collaborator from a specific playlist. Only the playlist owner can perform this action.
* **Method:** `DELETE`
* **Path:** `/collaborations`
* **Authentication:** Requires Authentication (Bearer Token)

#### Request Body

The request body must be a JSON object with the following properties:

| Parameter    | Type   | Description                                           | Required |
| :----------- | :----- | :---------------------------------------------------- | :------- |
| `playlistId` | string | The ID of the playlist to remove a collaborator from. | Yes      |
| `userId`     | string | The ID of the user to remove as a collaborator.       | Yes      |

**Example Request:**

```json
{
  "playlistId": "playlist-xxxxxxxxx",
  "userId": "user-yyyyyyyyy"
}
```

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "message": "Kolaborasi berhasil dihapus"
    }
    ```

* **Error (400 Bad Request):** If the payload is invalid.
* **Error (401 Unauthorized):** If the request lacks a valid Access Token.
* **Error (403 Forbidden):** If the authenticated user is not the owner of the playlist.
* **Error (404 Not Found):** If the `playlistId` or `userId` (as a collaborator on that playlist) does not exist or the collaboration itself doesn't exist.

    ```json
    {
        "status": "fail",
        "message": "Kolaborasi gagal dihapus. Id tidak ditemukan" // Or similar
    }
    ```

---

## Playlists API

The Playlists API allows authenticated users to manage their playlists, add or remove songs from them, and view playlist activities. All endpoints in this section require authentication using a Bearer Token.

### 1. Create Playlist

* **Purpose:** Creates a new playlist for the authenticated user.
* **Method:** `POST`
* **Path:** `/playlists`
* **Authentication:** Requires Authentication (Bearer Token)

#### Request Body

The request body must be a JSON object with the following property:

| Parameter | Type   | Description                    | Required |
| :-------- | :----- | :----------------------------- | :------- |
| `name`    | string | The name for the new playlist. | Yes      |

**Example Request:**

```json
{
  "name": "My Chill Vibes"
}
```

#### Responses

* **Success (201 Created):**

    ```json
    {
      "status": "success",
      "data": {
        "playlistId": "playlist-xxxxxxxxx"
      }
    }
    ```

* **Error (400 Bad Request):** If the payload is invalid (e.g., missing `name`).

    ```json
    {
      "status": "fail",
      "message": "Nama playlist wajib diisi"
    }
    ```

* **Error (401 Unauthorized):** If the request lacks a valid Access Token.

### 2. Get User's Playlists

* **Purpose:** Retrieves all playlists owned by or collaborated on by the authenticated user.
* **Method:** `GET`
* **Path:** `/playlists`
* **Authentication:** Requires Authentication (Bearer Token)

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "data": {
        "playlists": [
          {
            "id": "playlist-xxxxxxxxx",
            "name": "My Chill Vibes",
            "username": "currentuser"
          },
          {
            "id": "playlist-yyyyyyyyy",
            "name": "Workout Mix",
            "username": "currentuser"
          }
          // ... other playlists
        ]
      }
    }
    ```

* **Error (401 Unauthorized):** If the request lacks a valid Access Token.

### 3. Delete Playlist By ID

* **Purpose:** Deletes a specific playlist owned by the authenticated user.
* **Method:** `DELETE`
* **Path:** `/playlists/{id}`
* **Authentication:** Requires Authentication (Bearer Token)

#### Path Parameters

| Parameter | Type   | Description             | Required |
| :-------- | :----- | :---------------------- | :------- |
| `id`      | string | The ID of the playlist. | Yes      |

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "message": "Playlist berhasil dihapus"
    }
    ```

* **Error (401 Unauthorized):** If the request lacks a valid Access Token.
* **Error (403 Forbidden):** If the authenticated user is not the owner of the playlist.

    ```json
    {
        "status": "fail",
        "message": "Anda tidak berhak mengakses resource ini"
    }
    ```

* **Error (404 Not Found):** If the playlist with the specified ID does not exist.

    ```json
    {
        "status": "fail",
        "message": "Playlist tidak ditemukan" // Or similar from service layer
    }
    ```

### 4. Add Song to Playlist

* **Purpose:** Adds a song to a specific playlist. The authenticated user must own or have collaboration access to the playlist.
* **Method:** `POST`
* **Path:** `/playlists/{id}/songs`
* **Authentication:** Requires Authentication (Bearer Token)

#### Path Parameters

| Parameter | Type   | Description             | Required |
| :-------- | :----- | :---------------------- | :------- |
| `id`      | string | The ID of the playlist. | Yes      |

#### Request Body

The request body must be a JSON object with the following property:

| Parameter | Type   | Description                | Required |
| :-------- | :----- | :------------------------- | :------- |
| `songId`  | string | The ID of the song to add. | Yes      |

**Example Request:**

```json
{
  "songId": "song-zzzzzzzzz"
}
```

#### Responses

* **Success (201 Created):**

    ```json
    {
      "status": "success",
      "message": "Lagu berhasil ditambahkan ke playlist"
    }
    ```

* **Error (400 Bad Request):** If the payload is invalid (e.g., missing `songId`).

    ```json
    {
      "status": "fail",
      "message": "ID lagu wajib diisi"
    }
    ```

* **Error (401 Unauthorized):** If the request lacks a valid Access Token.
* **Error (403 Forbidden):** If the authenticated user does not have access to the playlist.

    ```json
    {
        "status": "fail",
        "message": "Anda tidak berhak mengakses resource ini"
    }
    ```

* **Error (404 Not Found):** If the playlist or song does not exist.

    ```json
    {
        "status": "fail",
        "message": "Lagu tidak ditemukan" // or "Playlist tidak ditemukan"
    }
    ```

### 5. Get Songs from Playlist

* **Purpose:** Retrieves all songs within a specific playlist. The authenticated user must own or have collaboration access to the playlist.
* **Method:** `GET`
* **Path:** `/playlists/{id}/songs`
* **Authentication:** Requires Authentication (Bearer Token)

#### Path Parameters

| Parameter | Type   | Description             | Required |
| :-------- | :----- | :---------------------- | :------- |
| `id`      | string | The ID of the playlist. | Yes      |

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "data": {
        "playlist": {
          "id": "playlist-xxxxxxxxx",
          "name": "My Chill Vibes",
          "username": "currentuser", // Owner of the playlist
          "songs": [
            {
              "id": "song-aaaaaaaaa",
              "title": "Chill Song 1",
              "performer": "Artist A"
            },
            {
              "id": "song-bbbbbbbbb",
              "title": "Relaxing Track 2",
              "performer": "Artist B"
            }
            // ... other songs
          ]
        }
      }
    }
    ```

* **Error (401 Unauthorized):** If the request lacks a valid Access Token.
* **Error (403 Forbidden):** If the authenticated user does not have access to the playlist.
* **Error (404 Not Found):** If the playlist does not exist.

### 6. Delete Song from Playlist

* **Purpose:** Removes a song from a specific playlist. The authenticated user must own or have collaboration access to the playlist.
* **Method:** `DELETE`
* **Path:** `/playlists/{id}/songs`
* **Authentication:** Requires Authentication (Bearer Token)

#### Path Parameters

| Parameter | Type   | Description             | Required |
| :-------- | :----- | :---------------------- | :------- |
| `id`      | string | The ID of the playlist. | Yes      |

#### Request Body

The request body must be a JSON object with the following property:

| Parameter | Type   | Description                   | Required |
| :-------- | :----- | :---------------------------- | :------- |
| `songId`  | string | The ID of the song to remove. | Yes      |

**Example Request:**

```json
{
  "songId": "song-aaaaaaaaa"
}
```

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "message": "Lagu berhasil dihapus dari playlist"
    }
    ```

* **Error (400 Bad Request):** If the payload is invalid.
* **Error (401 Unauthorized):** If the request lacks a valid Access Token.
* **Error (403 Forbidden):** If the authenticated user does not have access to the playlist.
* **Error (404 Not Found):** If the playlist or song does not exist.

### 7. Get Playlist Activities

* **Purpose:** Retrieves the activity log for a specific playlist (song additions/deletions). The authenticated user must own or have collaboration access to the playlist.
* **Method:** `GET`
* **Path:** `/playlists/{id}/activities`
* **Authentication:** Requires Authentication (Bearer Token)

#### Path Parameters

| Parameter | Type   | Description             | Required |
| :-------- | :----- | :---------------------- | :------- |
| `id`      | string | The ID of the playlist. | Yes      |

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "data": {
        "playlistId": "playlist-xxxxxxxxx",
        "activities": [
          {
            "username": "userA",
            "title": "Some Song Title",
            "action": "add",
            "time": "2023-10-27T10:00:00.000Z"
          },
          {
            "username": "userB",
            "title": "Another Song Title",
            "action": "delete",
            "time": "2023-10-27T10:05:00.000Z"
          }
          // ... other activities
        ]
      }
    }
    ```

* **Error (401 Unauthorized):** If the request lacks a valid Access Token.
* **Error (403 Forbidden):** If the authenticated user does not have access to the playlist.
* **Error (404 Not Found):** If the playlist does not exist.

---

## Authentications API

The Authentications API provides endpoints for user login, token refresh, and logout.

### 1. Login (Create Authentication)

* **Purpose:** Authenticates a user and returns an Access Token and a Refresh Token.
* **Method:** `POST`
* **Path:** `/authentications`
* **Authentication:** None (Public endpoint)

#### Request Body

The request body must be a JSON object with the following properties:

| Parameter  | Type   | Description          | Required |
| :--------- | :----- | :------------------- | :------- |
| `username` | string | The user's username. | Yes      |
| `password` | string | The user's password. | Yes      |

**Example Request:**

```json
{
  "username": "newuser",
  "password": "securepassword123"
}
```

#### Responses

* **Success (201 Created):**

    ```json
    {
      "status": "success",
      "message": "Authentication berhasil ditambahkan",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
    ```

* **Error (400 Bad Request):** If the payload is invalid.

    ```json
    {
      "status": "fail",
      "message": "username tidak boleh kosong" // Or other validation messages
    }
    ```

* **Error (401 Unauthorized):** If the credentials are invalid.

    ```json
    {
      "status": "fail",
      "message": "Kredensial yang Anda berikan salah"
    }
    ```

### 2. Refresh Access Token

* **Purpose:** Generates a new Access Token using a valid Refresh Token.
* **Method:** `PUT`
* **Path:** `/authentications`
* **Authentication:** None (Relies on valid Refresh Token in payload)

#### Request Body

The request body must be a JSON object with the following property:

| Parameter      | Type   | Description               | Required |
| :------------- | :----- | :------------------------ | :------- |
| `refreshToken` | string | The user's Refresh Token. | Yes      |

**Example Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "message": "Access Token berhasil diperbarui",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
    ```

* **Error (400 Bad Request):** If the payload is invalid (e.g., missing `refreshToken`, or `refreshToken` is not a string).

    ```json
    {
      "status": "fail",
      "message": "refresh token tidak boleh kosong"
    }
    ```

* **Error (400 Bad Request):** If the refresh token is invalid (e.g. not found in database or malformed).

    ```json
    {
        "status": "fail",
        "message": "Refresh token tidak valid"
    }
    ```

### 3. Logout (Delete Authentication)

* **Purpose:** Invalidates a Refresh Token, effectively logging the user out.
* **Method:** `DELETE`
* **Path:** `/authentications`
* **Authentication:** None (Relies on valid Refresh Token in payload)

#### Request Body

The request body must be a JSON object with the following property:

| Parameter      | Type   | Description               | Required |
| :------------- | :----- | :------------------------ | :------- |
| `refreshToken` | string | The user's Refresh Token. | Yes      |

**Example Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "message": "Refresh token berhasil dihapus"
    }
    ```

* **Error (400 Bad Request):** If the payload is invalid (e.g., missing `refreshToken`, or `refreshToken` is not a string).

    ```json
    {
      "status": "fail",
      "message": "refresh token tidak boleh kosong"
    }
    ```

* **Error (400 Bad Request):** If the refresh token is invalid (e.g. not found in database).

    ```json
    {
        "status": "fail",
        "message": "Refresh token tidak valid"
    }
    ```

---

## Users

The Users API allows for managing user accounts.

### 1. Create User (Register)

* **Purpose:** Registers a new user in the system.
* **Method:** `POST`
* **Path:** `/users`
* **Authentication:** None (Public endpoint)
  * *Note: User registration is typically a public endpoint.*

#### Request Body

The request body must be a JSON object with the following properties:

| Parameter  | Type   | Description                        | Required | Max Length |
| :--------- | :----- | :--------------------------------- | :------- | :--------- |
| `username` | string | The desired username for the user. | Yes      | 50         |
| `password` | string | The user's password.               | Yes      |            |
| `fullname` | string | The full name of the user.         | Yes      |            |

**Example Request:**

```json
{
  "username": "newuser",
  "password": "securepassword123",
  "fullname": "New User Fullname"
}
```

#### Responses

* **Success (201 Created):**

    ```json
    {
      "status": "success",
      "data": {
        "userId": "user-xxxxxxxxx"
      }
    }
    ```

* **Error (400 Bad Request):** If the payload is invalid (e.g., missing fields, username too long, username already taken).

    ```json
    {
      "status": "fail",
      "message": "Validation error message or username already taken"
    }
    ```

### 2. Get User By ID

* **Purpose:** Retrieves a specific user's public information by their ID.
* **Method:** `GET`
* **Path:** `/users/{id}`
* **Authentication:** None (Public endpoint)
  * *Note: While this endpoint is currently public, fetching user details, even public ones, is often protected to prevent data scraping or enumeration attacks. Authentication might be added in the future.*

#### Path Parameters

| Parameter | Type   | Description         | Required |
| :-------- | :----- | :------------------ | :------- |
| `id`      | string | The ID of the user. | Yes      |

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "data": {
        "user": {
          "id": "user-xxxxxxxxx",
          "username": "newuser",
          "fullname": "New User Fullname"
          // Note: Password is not returned
        }
      }
    }
    ```

* **Error (404 Not Found):** If the user with the specified ID does not exist.

    ```json
    {
      "status": "fail",
      "message": "User tidak ditemukan"
    }
    ```

---

## Albums

The Albums API allows for managing music albums.

### 1. Create Album

* **Purpose:** Adds a new album to the system.
* **Method:** `POST`
* **Path:** `/albums`
* **Authentication:** None (Public endpoint)
  * *Note: Typically, creating resources like albums requires authentication. This endpoint might be updated to require authentication in the future.*

#### Request Body

The request body must be a JSON object with the following properties:

| Parameter | Type   | Description                                     | Required |
| :-------- | :----- | :---------------------------------------------- | :------- |
| `name`    | string | The name of the album.                          | Yes      |
| `year`    | number | The release year of the album (1900 - current). | Yes      |

**Example Request:**

```json
{
  "name": "My Awesome Album",
  "year": 2023
}
```

#### Responses

* **Success (201 Created):**

    ```json
    {
      "status": "success",
      "data": {
        "albumId": "album-xxxxxxxxx"
      }
    }
    ```

* **Error (400 Bad Request):** If the payload is invalid.

    ```json
    {
      "status": "fail",
      "message": "Validation error message"
    }
    ```

### 2. Get Album By ID

* **Purpose:** Retrieves a specific album by its ID.
* **Method:** `GET`
* **Path:** `/albums/{id}`
* **Authentication:** None (Public endpoint)

#### Path Parameters

| Parameter | Type   | Description          | Required |
| :-------- | :----- | :------------------- | :------- |
| `id`      | string | The ID of the album. | Yes      |

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "data": {
        "album": {
          "id": "album-xxxxxxxxx",
          "name": "My Awesome Album",
          "year": 2023
          // Potentially other album details like songs, coverUrl
        }
      }
    }
    ```

    *(Note: The exact structure of the `album` object in the response will depend on the `AlbumsService.getAlbumById` implementation, which might include associated songs or other details. This will be updated if more information is found.)*

* **Error (404 Not Found):** If the album with the specified ID does not exist.

    ```json
    {
      "status": "fail",
      "message": "Album tidak ditemukan"
    }
    ```

### 3. Update Album By ID

* **Purpose:** Updates an existing album's details.
* **Method:** `PUT`
* **Path:** `/albums/{id}`
* **Authentication:** None (Public endpoint)
  * *Note: Typically, updating resources requires authentication. This endpoint might be updated to require authentication in the future.*

#### Path Parameters

| Parameter | Type   | Description          | Required |
| :-------- | :----- | :------------------- | :------- |
| `id`      | string | The ID of the album. | Yes      |

#### Request Body

The request body must be a JSON object with the following properties:

| Parameter | Type   | Description                                         | Required |
| :-------- | :----- | :-------------------------------------------------- | :------- |
| `name`    | string | The new name of the album.                          | Yes      |
| `year`    | number | The new release year of the album (1900 - current). | Yes      |

**Example Request:**

```json
{
  "name": "My Updated Awesome Album",
  "year": 2024
}
```

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "message": "Album berhasil diperbaharui"
    }
    ```

* **Error (400 Bad Request):** If the payload is invalid.

    ```json
    {
      "status": "fail",
      "message": "Validation error message"
    }
    ```

* **Error (404 Not Found):** If the album with the specified ID does not exist.

    ```json
    {
      "status": "fail",
      "message": "Gagal memperbarui album. Id tidak ditemukan" // Or similar
    }
    ```

### 4. Delete Album By ID

* **Purpose:** Deletes a specific album by its ID.
* **Method:** `DELETE`
* **Path:** `/albums/{id}`
* **Authentication:** None (Public endpoint)
  * *Note: Typically, deleting resources requires authentication. This endpoint might be updated to require authentication in the future.*

#### Path Parameters

| Parameter | Type   | Description          | Required |
| :-------- | :----- | :------------------- | :------- |
| `id`      | string | The ID of the album. | Yes      |

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "message": "Album berhasil dihapus"
    }
    ```

* **Error (404 Not Found):** If the album with the specified ID does not exist.

    ```json
    {
      "status": "fail",
      "message": "Album gagal dihapus. Id tidak ditemukan" // Or similar
    }
    ```

---

## Album Cover Uploads API

This API allows for uploading cover images for albums.

### 1. Upload Album Cover

* **Purpose:** Uploads a cover image for a specific album. The image will be associated with the album and its URL stored.
* **Method:** `POST`
* **Path:** `/albums/{id}/covers`
* **Authentication:** None (Public endpoint)
  * **Security Note:** This endpoint is currently public. Typically, uploading or modifying album details like covers should require authentication (e.g., only the album creator or an admin). This might be updated to require authentication in the future.

#### Path Parameters

| Parameter | Type   | Description                        | Required |
| :-------- | :----- | :--------------------------------- | :------- |
| `id`      | string | The ID of the album for the cover. | Yes      |

#### Request Body (multipart/form-data)

The request must be `multipart/form-data` and include the following part:

| Part Name | Type | Description                                                                                                                                                | Required |
| :-------- | :--- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| `cover`   | File | The image file for the album cover. Max size: 512KB. Allowed MIME types: `image/apng`, `image/avif`, `image/gif`, `image/jpeg`, `image/png`, `image/webp`. | Yes      |

**Example Request (conceptual, actual request is multipart/form-data):**

```
POST /albums/album-xxxxxxxxx/covers
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="cover"; filename="cover.jpg"
Content-Type: image/jpeg

(binary image data)
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

#### Responses

* **Success (201 Created):**

    ```json
    {
      "status": "success",
      "message": "Sampul berhasil diunggah"
    }
    ```

    *(Note: The handler also updates the album's `coverUrl` in the database with the URL provided by the storage service.)*

* **Error (400 Bad Request):** If the payload is invalid (e.g., wrong MIME type, file too large, no file).

    ```json
    {
      "status": "fail",
      "message": "Ukuran cover melebihi batas 512KB" // Or other validation messages like "Format cover tidak valid"
    }
    ```

* **Error (404 Not Found):** If the album with the specified `id` does not exist (though this check might be in the `albumsService.addCoverUrl` and could result in a different error if not handled explicitly before storage).

---

## Album Likes API

This API allows users to like or unlike albums and retrieve the like count for an album.

### 1. Like an Album

* **Purpose:** Allows an authenticated user to "like" a specific album.
* **Method:** `POST`
* **Path:** `/albums/{id}/likes`
* **Authentication:** Requires Authentication (Bearer Token)

#### Path Parameters

| Parameter | Type   | Description                      | Required |
| :-------- | :----- | :------------------------------- | :------- |
| `id`      | string | The ID of the album to be liked. | Yes      |

#### Request Body

None.

#### Responses

* **Success (201 Created):**

    ```json
    {
      "status": "success",
      "message": "Album berhasil disukai"
    }
    ```

* **Error (401 Unauthorized):** If the request lacks a valid Access Token.
* **Error (404 Not Found):** If the album with the specified `id` does not exist.

    ```json
    {
      "status": "fail",
      "message": "Album tidak ditemukan" // Or similar if like service checks album existence
    }
    ```

* **Error (400 Bad Request):** If the user has already liked the album or other validation error.

    ```json
    {
      "status": "fail",
      "message": "Gagal menyukai album" // Or more specific message
    }
    ```

### 2. Unlike an Album

* **Purpose:** Allows an authenticated user to remove their "like" from a specific album.
* **Method:** `DELETE`
* **Path:** `/albums/{id}/likes`
* **Authentication:** Requires Authentication (Bearer Token)

#### Path Parameters

| Parameter | Type   | Description                        | Required |
| :-------- | :----- | :--------------------------------- | :------- |
| `id`      | string | The ID of the album to be unliked. | Yes      |

#### Request Body

None.

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "message": "Like berhasil dihapus"
    }
    ```

* **Error (401 Unauthorized):** If the request lacks a valid Access Token.
* **Error (404 Not Found):** If the album with the specified `id` does not exist or the user hasn't liked it.

    ```json
    {
      "status": "fail",
      "message": "Gagal menghapus like" // Or more specific message
    }
    ```

### 3. Get Album Like Count

* **Purpose:** Retrieves the total number of likes for a specific album.
* **Method:** `GET`
* **Path:** `/albums/{id}/likes`
* **Authentication:** None (Public endpoint)

#### Path Parameters

| Parameter | Type   | Description                           | Required |
| :-------- | :----- | :------------------------------------ | :------- |
| `id`      | string | The ID of the album to get likes for. | Yes      |

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "data": {
        "likes": 150
      }
    }
    ```

    *(Note: The response may include an `X-Data-Source: cache` header if the like count was retrieved from cache.)*

* **Error (404 Not Found):** If the album with the specified `id` does not exist.

    ```json
    {
      "status": "fail",
      "message": "Album tidak ditemukan" // Or similar
    }
    ```

---

## Songs

The Songs API allows for managing music songs.

### 1. Create Song

* **Purpose:** Adds a new song to the system.
* **Method:** `POST`
* **Path:** `/songs`
* **Authentication:** None (Public endpoint)
  * *Note: Typically, creating resources like songs requires authentication. This endpoint might be updated to require authentication in the future.*

#### Request Body

The request body must be a JSON object with the following properties:

| Parameter   | Type   | Description                                          | Required |
| :---------- | :----- | :--------------------------------------------------- | :------- |
| `title`     | string | The title of the song.                               | Yes      |
| `year`      | number | The release year of the song (1900 - current).       | Yes      |
| `genre`     | string | The genre of the song.                               | Yes      |
| `performer` | string | The performer of the song.                           | Yes      |
| `duration`  | number | The duration of the song in seconds (optional).      | No       |
| `albumId`   | string | The ID of the album this song belongs to (optional). | No       |

**Example Request:**

```json
{
  "title": "My New Song",
  "year": 2023,
  "genre": "Pop",
  "performer": "Awesome Artist",
  "duration": 180,
  "albumId": "album-xxxxxxxxx"
}
```

#### Responses

* **Success (201 Created):**

    ```json
    {
      "status": "success",
      "data": {
        "songId": "song-xxxxxxxxx"
      }
    }
    ```

* **Error (400 Bad Request):** If the payload is invalid.

    ```json
    {
      "status": "fail",
      "message": "Validation error message"
    }
    ```

### 2. Get All Songs

* **Purpose:** Retrieves all songs, with optional filtering by title and performer.
* **Method:** `GET`
* **Path:** `/songs`
* **Authentication:** None (Public endpoint)

#### Query Parameters

| Parameter   | Type   | Description                                          | Required |
| :---------- | :----- | :--------------------------------------------------- | :------- |
| `title`     | string | Filter songs by title (case-insensitive search).     | No       |
| `performer` | string | Filter songs by performer (case-insensitive search). | No       |

**Example Request:**

`/songs?title=love&performer=artist`

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "data": {
        "songs": [
          {
            "id": "song-xxxxxxxxx",
            "title": "Love Song",
            "performer": "Some Artist"
          },
          {
            "id": "song-yyyyyyyyy",
            "title": "Another Love Song",
            "performer": "Different Artist"
          }
          // ... other songs
        ]
      }
    }
    ```

    *(Note: The response for `getAllSongsHandler` only includes `id`, `title`, and `performer` for each song. More detailed information requires fetching a specific song by ID.)*

### 3. Get Song By ID

* **Purpose:** Retrieves a specific song by its ID.
* **Method:** `GET`
* **Path:** `/songs/{id}`
* **Authentication:** None (Public endpoint)

#### Path Parameters

| Parameter | Type   | Description         | Required |
| :-------- | :----- | :------------------ | :------- |
| `id`      | string | The ID of the song. | Yes      |

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "data": {
        "song": {
          "id": "song-xxxxxxxxx",
          "title": "My New Song",
          "year": 2023,
          "genre": "Pop",
          "performer": "Awesome Artist",
          "duration": 180,
          "albumId": "album-xxxxxxxxx"
        }
      }
    }
    ```

* **Error (404 Not Found):** If the song with the specified ID does not exist.

    ```json
    {
      "status": "fail",
      "message": "Lagu tidak ditemukan"
    }
    ```

### 4. Update Song By ID

* **Purpose:** Updates an existing song's details.
* **Method:** `PUT`
* **Path:** `/songs/{id}`
* **Authentication:** None (Public endpoint)
  * *Note: Typically, updating resources requires authentication. This endpoint might be updated to require authentication in the future.*

#### Path Parameters

| Parameter | Type   | Description         | Required |
| :-------- | :----- | :------------------ | :------- |
| `id`      | string | The ID of the song. | Yes      |

#### Request Body

The request body must be a JSON object with the following properties:

| Parameter   | Type   | Description                                              | Required |
| :---------- | :----- | :------------------------------------------------------- | :------- |
| `title`     | string | The new title of the song.                               | Yes      |
| `year`      | number | The new release year of the song (1900 - current).       | Yes      |
| `genre`     | string | The new genre of the song.                               | Yes      |
| `performer` | string | The new performer of the song.                           | Yes      |
| `duration`  | number | The new duration of the song in seconds (optional).      | No       |
| `albumId`   | string | The new ID of the album this song belongs to (optional). | No       |

**Example Request:**

```json
{
  "title": "My Updated Song",
  "year": 2024,
  "genre": "Rock",
  "performer": "New Artist",
  "duration": 200,
  "albumId": "album-yyyyyyyyy"
}
```

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "message": "Lagu berhasil diperbaharui"
    }
    ```

* **Error (400 Bad Request):** If the payload is invalid.

    ```json
    {
      "status": "fail",
      "message": "Validation error message"
    }
    ```

* **Error (404 Not Found):** If the song with the specified ID does not exist.

    ```json
    {
      "status": "fail",
      "message": "Gagal memperbarui lagu. Id tidak ditemukan" // Or similar
    }
    ```

### 5. Delete Song By ID

* **Purpose:** Deletes a specific song by its ID.
* **Method:** `DELETE`
* **Path:** `/songs/{id}`
* **Authentication:** None (Public endpoint)
  * *Note: Typically, deleting resources requires authentication. This endpoint might be updated to require authentication in the future.*

#### Path Parameters

| Parameter | Type   | Description         | Required |
| :-------- | :----- | :------------------ | :------- |
| `id`      | string | The ID of the song. | Yes      |

#### Responses

* **Success (200 OK):**

    ```json
    {
      "status": "success",
      "message": "Lagu berhasil dihapus"
    }
    ```

* **Error (404 Not Found):** If the song with the specified ID does not exist.

    ```json
    {
      "status": "fail",
      "message": "Lagu gagal dihapus. Id tidak ditemukan" // Or similar
    }
    ```

---
