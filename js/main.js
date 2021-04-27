var hashtagInput = $('#input-hashtag');
var searchBtn = $('#btn-search');
var hashtag = hashtagInput.val();
const gallery = $('#gallery');

hashtagInput.on('input', function() {
  hashtag = hashtagInput.val();
  if(hashtagInput.val().length === 0) {
    searchBtn.attr('disabled', '');
  } else {
    searchBtn.removeAttr('disabled');
  }
});

searchBtn.click(function() {
  gallery.empty();
  containerName = hashtag;
  var xhr = new XMLHttpRequest();
  xhr.open(
    "POST", 
    "https://prod-07.germanywestcentral.logic.azure.com/workflows/f755f2ff82414fffae5a2ab63b861cf9/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=0cr_DTE54rOrS7z1kk__7jAFrtmwERzhGhSVbgi2UFg", true
  );
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(
    { Posts:
      [
        {
          Hashtag: hashtag,
        }
      ]
    }
  ));

  xhr.onload = function() {
    console.log("onload")
    console.log(this.responseText);
    showImages();
    setInterval(function(){
      showImages();
      macy.recalculate();
    }, 1000);
  }
});

const { BlobServiceClient } = require("@azure/storage-blob");

const blobSasUrl = "https://csb100320012c385cd6.blob.core.windows.net/?sv=2020-02-10&ss=bfqt&srt=sco&sp=rwdlacupx&se=2021-10-01T05:23:17Z&st=2021-04-24T21:23:17Z&spr=https,http&sig=2kc1hW%2FUQCq5KumTmNFPWRQnmzYqNVG%2FDS0iqbTUpAQ%3D";

// Create a new BlobServiceClient
const blobServiceClient = new BlobServiceClient(blobSasUrl);

var containerName = '';

const urls = [];
const showImages = async () => {
  // Get a container client from the BlobServiceClient
  const containerClient = blobServiceClient.getContainerClient(containerName);
  try {
    console.log("Retrieving file list...");
    let iter = containerClient.listBlobsFlat();
    let blobItem = await iter.next();
    while (!blobItem.done) {
      url = getImgURL(blobItem.value.name);
      if (!urls.includes(url)) {
        gallery.append($(`<img style="display: block; margin: auto;" src="${url}"/>`).hide().fadeTo( "slow" , 1))
        urls.push(url);
      }
      blobItem = await iter.next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

var macy = Macy({
  container: '#gallery',
  trueOrder: true,
  waitForImages: true,
  margin: 1,
  columns: 3,
  breakAt: {
      1200: 3,
      940: 2,
      520: 2,
      400: 1
  }
});

function getImgURL(blobName) {
  var url = blobName.replace('__pbs', '//pbs');
  url = url.replace('_media_', '/media/');
  return url;
}