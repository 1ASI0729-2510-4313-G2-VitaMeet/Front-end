export class Profile {
  id: number;
  fullname: string;
  adress: string;
  image: string;
  bio: string;


  constructor(profile: {id?: number, fullname?: string, adress?: string, image?: string, bio?: string}) {
    this.id = profile.id || 0;
    this.fullname = profile.fullname || '';
    this.adress = profile.adress || '';
    this.image = profile.image || '';
    this.bio = profile.bio || '';
  }
}
