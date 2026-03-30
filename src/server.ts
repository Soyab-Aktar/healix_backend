import app from "./app";


const bootstrap = () => {
  try {
    app.listen(5000, () => {
      console.log(`Server is running on http://localhost:5000`);
    })
  } catch (error) {
    console.error('Failed to Start Server :', error);
  }
}
// const bootstrap = () => {
//   try {
//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running on http://localhost:${process.env.PORT}`);
//     })
//   } catch (error) {
//     console.error('Failed to Start Server :', error);
//   }
// }

bootstrap();