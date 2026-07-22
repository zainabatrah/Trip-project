# Trip Project

Free deployment target: Render for the frontend and backend, plus MongoDB Atlas M0 for MongoDB.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/zainabatrah/Trip-project)

## Deploy

1. Open the Deploy to Render button above.
2. Connect the `zainabatrah/Trip-project` repository if Render asks for GitHub access.
3. In the Blueprint form, set `MONGODB_URI` to your MongoDB Atlas connection string.
4. Deploy the two services created by `render.yaml`:
   - `trip-project-api`
   - `trip-project-web`

## Notes

- The frontend static site is prewired to the backend service URL at build time.
- The backend CORS origin is prewired to the frontend service URL.
- Free Render web services spin down after inactivity and can take about a minute to wake up again.
- Free Render web services use ephemeral storage, so uploaded files in `backend/uploads` are lost after redeploys, restarts, or spin-down events. For persistent uploads, move file storage to a service such as Cloudinary or S3-compatible object storage.
