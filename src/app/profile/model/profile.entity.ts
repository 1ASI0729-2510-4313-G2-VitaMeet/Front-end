export class Profile3D {
  id: number;
  fullname: string;
  adress: string;
  photo: string;
  bio: string;


  constructor(profile: {id?: number, fullname?: string, adress?: string, photo?: string, bio?: string}) {
    this.id = profile.id || 0;
    this.fullname = profile.fullname || '';
    this.adress = profile.adress || '';
    this.photo = profile.photo || '';
    this.bio = profile.bio || '';
  }
}
