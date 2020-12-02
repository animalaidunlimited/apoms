self.addEventListener('fetch', event => {

  // Handle the share_target shares
  if (event.request.method === 'POST') {

    // Make sure we're only getting shares to the emergency-register route
    const path = event.request.url.split("/").pop();

    if(path === "emergency-register"){

        //Get the images and videos from the share request
        event.request.formData().then(formData => {

            // Find the correct client in order to share the results.
            const clientId = event.resultingClientId !== "" ? event.resultingClientId : event.clientId;
            self.clients.get(clientId).then(client => {

                // Send them to the client
                client.postMessage(
                    {
                        message: "newMedia",
                        image: formData.getAll('image'),
                        video: formData.getAll('video')
                    }
                );
            });
        });
    }
  }
});


importScripts('./ngsw-worker.js');

