import { makeApiRequest } from "./utils.js";
import { renderProfilPage } from "./renderDiv/profil_card.js"

const profilPage = document.getElementById('profil_page');
const avatar = document.getElementById('avatar');


export async function isFriend(user) {
    console.log(user);
    try {
        const response = await makeApiRequest(user)
        if (response.status == 400) {
            console.log("ici")
            return false;
        }
        else if (response.status == 404) {
            throw new Error('Erreur lors de la récupération des données');
        }
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données');
        }
        // const data = await response.json();
        return true
    } catch (error) {
        throw new Error("404 Not found");
    }
}


async function displayAvatar() {
    try {
        const response = await makeApiRequest("avatar");
        const avatarData = await response.json();
        if (avatarData.avatar) {
            const dataUri = 'data:image/jpeg;base64,' + avatarData.avatar;
            updateAvatarImage(dataUri);
        }
    } catch (error) {
        console.error('Avatar fetch failed:', error);
        updateAvatarImage(defaultAvatarDataUri);
    }
}

function updateAvatarImage(dataUri) {
    const avatarImage = document.getElementById('avatar-image');
    if (avatarImage) {
        avatarImage.src = '';  // Clear the current source
        avatarImage.src = dataUri;  // Set the new source
        avatarImage.alt = 'user-avatar';
    }
}
export { renderProfilPage, displayAvatar};
