export class Profile {
  id: number;
  name: string;
  adress: string;
  image: string;
  bio: string;


  constructor(profile: {id?: number, name?: string, adress?: string, image?: string, bio?: string}) {
    this.id = profile.id || 0;
    this.name = profile.name || '';
    this.adress = profile.adress || '';
    this.image = profile.image || '';
    this.bio = profile.bio || '';
  }
}
