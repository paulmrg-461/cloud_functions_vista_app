const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp(functions.config().functions);

exports.notifyNewMessage = functions.firestore.document("/messages/{id}")
    .onCreate((docSnapshot, context) => {
        const message = docSnapshot.data();
        const title = message["title"];
        const body = message["body"] || "";
        const photoUrl = message["photoUrl"] || "";
        const senderId = message["senderId"];
        const receiverId = message["receiverId"];
        const seen = message["seen"] || "0";
        const id = docSnapshot.id

    return admin
      .firestore()
      .doc("users/" + receiverId)
      .get()
      .then((userDoc) => {
        const registrationTokens = userDoc.get("deviceTokens");
        const payload = {
            notification: {
                title: title,
                body: body,
                image: photoUrl,
            },
            data: {
                seen: `${seen}`,
                date: `${new Date().toISOString()}`,
                photoUrl,
                senderId,
                receiverId,
                documentId: id
            },
        };

        return admin
          .messaging()
          .sendToDevice(registrationTokens, payload)
          .then((response) => {
            const stillRegisteredTokens = registrationTokens;

            response.results.forEach((result, index) => {
              const error = result.error;
              if (error) {
                const failedRegistrationToken = registrationTokens[index];
                console.error(
                  `Ha ocurrido un error al registrar el token de usuarios: ${failedRegistrationToken} ${error}`
                );
                if (
                  error.code === "messaging/invalid-registration-token" ||
                  error.code ===
                    "messaging/invalid-registration-token-not-registered"
                ) {
                  const failedIndex = stillRegisteredTokens.indexOf(
                    failedRegistrationToken
                  );
                  if (failedIndex > -1) {
                    stillRegisteredTokens.splice(failedIndex, 1);
                  }
                }
              }
            });
            return admin
              .firestore()
              .doc("users/" + receiverId)
              .update({
                deviceTokens: stillRegisteredTokens,
              });
          });
      });
  });

exports.notifyNewUser = functions.firestore.document("/users/{id}")
    .onCreate((docSnapshot, context) => {
        const message = docSnapshot.data();
        const clientName = message["clientName"];
        const photoUrl = message["clientPhotoURL"] || "";
        const senderId = message["clientEmail"];
        const id = docSnapshot.id

    return admin
      .firestore()
      .collection("professionals")
      .where('isAdmin','==',true)
      .get()
      .then((professionalDocs) => {
        professionalDocs.forEach((pd, index) => {
          console.log(pd.get("email"));
          const registrationTokens = pd.get("deviceTokens");
          const payload = {
              notification: {
                  title: `${clientName} se ha registrado como usuario.`,
                  body: `${clientName} ha solicitado unirse como nuevo usuario en el Grupo Vista.`,
                  image: photoUrl,
              },
              data: {
                  date: `${new Date().toISOString()}`,
                  photoUrl,
                  senderId,
                  documentId: id
              },
          };
  
          return admin
            .messaging()
            .sendToDevice(registrationTokens, payload)
            .then((response) => {
              const stillRegisteredTokens = registrationTokens;
  
              response.results.forEach((result, index) => {
                const error = result.error;
                if (error) {
                  const failedRegistrationToken = registrationTokens[index];
                  console.error(
                    `Ha ocurrido un error al registrar el token de usuarios: ${failedRegistrationToken} ${error}`
                  );
                  if (
                    error.code === "messaging/invalid-registration-token" ||
                    error.code ===
                      "messaging/invalid-registration-token-not-registered"
                  ) {
                    const failedIndex = stillRegisteredTokens.indexOf(
                      failedRegistrationToken
                    );
                    if (failedIndex > -1) {
                      stillRegisteredTokens.splice(failedIndex, 1);
                    }
                  }
                }
              });
              return admin
                .firestore()
                .doc("professionals/" + pd.get("email"))
                .update({
                  deviceTokens: stillRegisteredTokens,
                });
            });
        });
      });
  });

exports.notifyNewRequest = functions.firestore.document("/serviceRequests/{id}")
    .onCreate((docSnapshot, context) => {
        const message = docSnapshot.data();
        const clientName = message["name"];
        const photoUrl = message["photoUrl"] || "";
        const senderId = message["email"];
        const type = message["type"];
        const id = docSnapshot.id

    return admin
      .firestore()
      .collection("professionals")
      .where('profession','==',type)
      .get()
      .then((professionalDocs) => {
        professionalDocs.forEach((pd, index) => {
          const registrationTokens = pd.get("deviceTokens");
          const payload = {
              notification: {
                  title: `${clientName} solicita un servicio.`,
                  body: `${clientName} ha solicitado un servicio de ${type} en el Grupo Vista.`,
                  image: photoUrl,
              },
              data: {
                  date: `${new Date().toISOString()}`,
                  photoUrl,
                  senderId,
                  type,
                  documentId: id
              },
          };
  
          return admin
            .messaging()
            .sendToDevice(registrationTokens, payload)
            .then((response) => {
              const stillRegisteredTokens = registrationTokens;
  
              response.results.forEach((result, index) => {
                const error = result.error;
                if (error) {
                  const failedRegistrationToken = registrationTokens[index];
                  console.error(
                    `Ha ocurrido un error al registrar el token de usuarios: ${failedRegistrationToken} ${error}`
                  );
                  if (
                    error.code === "messaging/invalid-registration-token" ||
                    error.code ===
                      "messaging/invalid-registration-token-not-registered"
                  ) {
                    const failedIndex = stillRegisteredTokens.indexOf(
                      failedRegistrationToken
                    );
                    if (failedIndex > -1) {
                      stillRegisteredTokens.splice(failedIndex, 1);
                    }
                  }
                }
              });
              return admin
                .firestore()
                .doc("professionals/" + pd.get("email"))
                .update({
                  deviceTokens: stillRegisteredTokens,
                });
            });
        });
      });
  });
