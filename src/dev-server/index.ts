import { DevServerBuilder } from '@angular-devkit/build-angular';
import { Path, virtualFs } from '@angular-devkit/core';
import { BuilderConfiguration, BuildEvent } from '@angular-devkit/architect';
import { NormalizedPluginBrowserBuilderSchema, PluginBrowserBuilderSchema } from '../browser/schema';
import { PluginDevServerBuilderOptions } from './schema';
import { BuildPlugin } from '../build-plugin';
import { PluginBrowserBuilder } from '../browser';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Stats } from 'fs';

export class PluginDevServerBuilder extends DevServerBuilder {
  run(builderConfig: BuilderConfiguration<PluginDevServerBuilderOptions>): Observable<BuildEvent> {
    const architect = this.context.architect;
    const [project, target, configuration] = builderConfig.options.browserTarget.split(':');

    const browserTargetSpec = { project, target, configuration };
    const browserBuilderConfig = architect.getBuilderConfiguration<PluginBrowserBuilderSchema>(browserTargetSpec);

    builderConfig.options.plugin = builderConfig.options.plugin || browserBuilderConfig.options.plugin;

    BuildPlugin.loadPlugin(this.context.workspace.root, builderConfig.options);
    BuildPlugin.runHook(BuildPlugin.PRE_HOOK, builderConfig);

    return super.run(builderConfig).pipe(tap(() => BuildPlugin.runHook(BuildPlugin.POST_HOOK, builderConfig)));
  }

  buildWebpackConfig(
    root: Path,
    projectRoot: Path,
    host: virtualFs.Host<Stats>,
    options: NormalizedPluginBrowserBuilderSchema
  ) {
    const browserBuilder = new PluginBrowserBuilder(this.context);
    return browserBuilder.buildWebpackConfig(root, projectRoot, host, options);
  }
}

export default PluginDevServerBuilder;
