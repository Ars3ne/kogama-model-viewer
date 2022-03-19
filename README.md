# kogama-model-viewer

An simple React component that uses [react-three-fiber](https://github.com/pmndrs/react-three-fiber) to render a model from the online game [KoGaMa](https://kogama.com) on a webpage. You can see a live example [here](https://ars3ne.github.io/kogama/kogama-model-viewer/).

## TODO:
- [ ] Improve performance on bigger models (make it a single object?)
- [ ] Improve lightning
- [ ] Make the model centralized to the camera
- [ ] Add block animations (Poison, Lava, Kill, Bouncy, Super Bouncy)
- [ ] Add avatar viewer
- [ ] Add blueprint viewer
- [ ] Add support to model scale
- [ ] Improve model accuracy (Add support to hacked stuff)
- [ ] Properly implement some functions
- [ ] Use a texture atlas (?)

## FAQ:

### How can I use another model rather than the example one?
You need to retrieve the model information from KoGaMa servers, and then send this information in the ``data`` prop. Unfortunately, I do not plan to release a tutorial on how to do this right now. But on my personal tests, this component should work on all models from the three servers.

### I have another question that was not answered here. Where can I get an answer?
You can get in touch with me on Discord: ``Ars3ne#0497``. Please keep in mind that I'm not very active on Discord anymore due to personal reasons, so it might take a while for me to respond.