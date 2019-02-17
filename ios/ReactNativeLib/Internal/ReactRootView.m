#import "ReactRootView.h"
#import <React/RCTRootView.h>

@implementation ReactRootView

+ (UIView *)rootViewWithBundleURL:(NSURL *)bundleURL moduleName:(NSString *)moduleName initialProperties:(NSDictionary *)initialProperties launchOptions:(NSDictionary *)launchOptions
{
  return [[RCTRootView alloc] initWithBundleURL:bundleURL moduleName:moduleName initialProperties:initialProperties launchOptions:launchOptions];
}

@end
